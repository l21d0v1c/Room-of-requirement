import React from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-8">Bienvenue sur votre application !</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
        Ceci est votre page d'accueil par défaut.
      </p>
      <MadeWithDyad />
    </div>
  );
};

export default Index;