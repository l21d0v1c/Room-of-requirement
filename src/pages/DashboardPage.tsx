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

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        // If no user, redirect to login
        navigate('/');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError(`Erreur lors de la déconnexion : ${error.message}`);
    } else {
      showSuccess("Vous avez été déconnecté avec succès.", 2000); // Ajout de la durée pour la déconnexion
      navigate('/'); // Rediriger vers la page d'accueil après la déconnexion
    }
  };

  const handleLoadThingClick = () => {
    fileInputRef.current?.click(); // Déclenche le clic sur l'input de fichier masqué
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
    showSuccess("Téléchargement en cours...", 2000); // Affiche le toast de chargement avec durée

    try {
      // Nettoyer le nom du fichier pour supprimer les caractères spéciaux
      const sanitizedFileName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const filePath = `${userId}/${Date.now()}_${sanitizedFileName}`; // Chemin unique pour le fichier

      const { error } = await supabase.storage
        .from('things') // Nom du bucket Supabase
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        showError(`Erreur lors du téléchargement : ${error.message}`);
      } else {
        showSuccess("Mischief managed", 2000); // Nouveau message et durée
        // Pas de redirection ici, l'utilisateur reste sur le tableau de bord
      }
    } catch (err: any) {
      showError(`Une erreur inattendue est survenue : ${err.message}`);
    } finally {
      setIsUploading(false);
      // Reset the file input to allow uploading the same file again if needed
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
        className="hidden" // Masque l'input de fichier
      />
      <Button onClick={handleLoadThingClick} className="mt-4 mb-4" disabled={isUploading || !userId}>
        {isUploading ? "Téléchargement..." : "Load a thing"}
      </Button>
      <Button onClick={handleLogout} className="mt-4" disabled={isUploading}>
        Se déconnecter
      </Button>
    </div>
  );
};

export default DashboardPage;