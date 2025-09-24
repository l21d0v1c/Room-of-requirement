"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { showError, showSuccess } from '@/utils/toast';

const DashboardPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [latestFileToDownload, setLatestFileToDownload] = useState<{ name: string; path: string } | null>(null);

  // Fonction pour récupérer les fichiers de l'utilisateur
  const fetchUserFiles = async (currentUserId: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('things')
        .list(currentUserId, {
          sortBy: { column: 'created_at', order: 'desc' },
          limit: 1, // Nous ne voulons que le dernier fichier
        });

      if (error) {
        console.error("Error listing files:", error.message);
        showError(`Erreur lors de la récupération des fichiers : ${error.message}`);
        setLatestFileToDownload(null);
      } else if (data && data.length > 0) {
        const latestFile = data[0];
        // Le chemin complet est 'userId/nom_du_fichier'
        setLatestFileToDownload({ name: latestFile.name, path: `${currentUserId}/${latestFile.name}` });
      } else {
        setLatestFileToDownload(null);
      }
    } catch (err: any) {
      console.error("Unexpected error fetching files:", err.message);
      showError(`Une erreur inattendue est survenue lors de la récupération des fichiers : ${err.message}`);
      setLatestFileToDownload(null);
    }
  };

  useEffect(() => {
    const fetchUserAndFiles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchUserFiles(user.id); // Récupère les fichiers dès que l'ID utilisateur est disponible
      } else {
        navigate('/');
      }
    };
    fetchUserAndFiles();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError(`Erreur lors de la déconnexion : ${error.message}`);
    } else {
      showSuccess("Vous avez été déconnecté avec succès.", 2000);
      navigate('/');
    }
  };

  const handleDownloadThing = async () => {
    if (!latestFileToDownload || !userId) {
      showError("Aucun fichier à télécharger.");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('things')
        .download(latestFileToDownload.path);

      if (error) {
        showError(`Erreur lors du téléchargement du fichier : ${error.message}`);
        return;
      }

      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = latestFileToDownload.name; // Utilise le nom de fichier original
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
    if (latestFileToDownload) {
      handleDownloadThing(); // Si un fichier existe, télécharge-le
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
      const sanitizedFileName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const filePath = `${userId}/${Date.now()}_${sanitizedFileName}`;

      const { error } = await supabase.storage
        .from('things')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        showError(`Erreur lors du téléchargement : ${error.message}`);
      } else {
        showSuccess("Mischief managed", 2000);
        await fetchUserFiles(userId); // Rafraîchit la liste des fichiers après un upload réussi
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
        {isUploading ? "Téléchargement..." : (latestFileToDownload ? "Load the thing" : "Load a thing")}
      </Button>
      <Button onClick={handleLogout} className="mt-4" disabled={isUploading}>
        Se déconnecter
      </Button>
    </div>
  );
};

export default DashboardPage;