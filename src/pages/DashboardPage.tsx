"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { showError, showSuccess } from '@/utils/toast';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError(`Erreur lors de la déconnexion : ${error.message}`);
    } else {
      showSuccess("Vous avez été déconnecté avec succès.");
      navigate('/'); // Rediriger vers la page d'accueil après la déconnexion
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8">
        Room of Requirement
      </h1>
      <Button onClick={handleLogout} className="mt-4">
        Se déconnecter
      </Button>
    </div>
  );
};

export default DashboardPage;