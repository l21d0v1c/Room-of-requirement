import React from 'react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const IndexPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Bienvenue dans votre application Dyad
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        Ceci est votre page d'accueil par défaut.
      </p>
      <p className="text-md text-gray-500 dark:text-gray-400 mt-2">
        Vous pouvez commencer à construire votre application ici.
      </p>
      <div className="mt-8">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default IndexPage;