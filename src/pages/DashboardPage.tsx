"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { showError, showSuccess } from '@/utils/toast';

const FIXED_FILE_NAME = "the_thing_file"; // Nom de fichier fixe pour le fichier unique de l'utilisateur

const DashboardPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false); // Indique si un fichier existe pour l'utilisateur

  // Fonction pour vérifier si le fichier fixe existe pour l'utilisateur
  const checkIfFileExists = async (currentUserId: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('things')
        .list(currentUserId, {
          search: FIXED_FILE_NAME, // Recherche le fichier spécifique dans le dossier de l'utilisateur
          limit: 1
        });

      if (error) {
        console.error("Error checking file existence:", error.message);
        showError(`Erreur lors de la vérification du fichier : ${error.message}`);
        setFileUploaded(false);
        return;
      }

      // Si des données sont retournées et que le nom du fichier correspond, alors le fichier existe
      if (data && data.length > 0 && data[0].name === FIXED_FILE_NAME) {
        setFileUploaded(true);
      } else {
        setFileUploaded(false);
      }
    } catch (err: any) {
      console.error("Unexpected error checking file existence:", err.message);
      showError(`Une erreur inattendue est survenue lors de la vérification du fichier : ${err.message}`);
      setFileUploaded(false);
    }
  };

  useEffect(() => {
    const fetchUserAndCheckFile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await checkIfFileExists(user.id); // Vérifie l'existence du fichier au chargement
      } else {
        navigate('/');
      }
    };
    fetchUserAndCheckFile();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError(`Erreur lors de la déconnexion : ${error.message}`);
    } else {
      showSuccess("Mischief managed", 2000); // Message mis à jour ici
      navigate('/');
    }
  };

  const handleDownloadThing = async () => {
    if (!userId) {
      showError("Impossible de télécharger le fichier : utilisateur non identifié.");
      return;
    }

    const filePath = `${userId}/${FIXED_FILE_NAME}`;

    try {
      const { data, error } = await supabase.storage
        .from('things')
        .download(filePath);

      if (error) {
        showError(`Erreur lors du téléchargement du fichier : ${error.message}`);
        return;
      }

      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        // Le fichier sera téléchargé avec le nom fixe. Si le nom original est requis,
        // il faudrait le stocker dans les métadonnées lors de l'upload.
        a.download = FIXED_FILE_NAME; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSuccess("Fichier téléchargé avec succès !", 2000);
      }
    } catch (err: any) {
      showError(`Une erreur inattendue est survenue lors du téléchargement : ${err.message}`);
    }
  };

  const handleLoadThingClick = () => {
    if (fileUploaded) {
      handleDownloadThing(); // Si un fichier existe, le télécharge
    } else {
      fileInputRef.current?.click(); // Sinon, ouvre la boîte de dialogue d'upload
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!userId) {
      showError("Impossible de télécharger le fichier : utilisateur non identifié.");
      return;
    }

    setIsUploading(true);
    showSuccess("Téléchargement en cours...", 2000);

    try {
      const filePath = `${userId}/${FIXED_FILE_NAME}`; // Toujours uploader vers le chemin fixe

      const { error } = await supabase.storage
        .from('things')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Important : remplace le fichier existant
          contentType: file.type, // Définit le type de contenu pour une bonne gestion
        });

      if (error) {
        showError(`Erreur lors du téléchargement : ${error.message}`);
      } else {
        showSuccess("Mischief managed", 2000);
        setFileUploaded(true); // Met à jour l'état pour indiquer qu'un fichier est maintenant uploadé
      }
    } catch (err: any) {
      showError(`Une erreur inattendue est survenue : ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8">
        Room of Requirement
      </h1>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button onClick={handleLoadThingClick} className="mt-4 mb-4" disabled={isUploading || !userId}>
        {isUploading ? "Téléchargement..." : (fileUploaded ? "Load the thing" : "Load a thing")}
      </Button>
      <Button onClick={handleLogout} className="mt-4" disabled={isUploading}>
        Quit the room
      </Button>
    </div>
  );
};

export default DashboardPage;