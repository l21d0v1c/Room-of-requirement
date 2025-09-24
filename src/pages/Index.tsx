import React from 'react';
import LoginForm from '@/components/LoginForm';
import WelcomeDialog from '@/components/WelcomeDialog'; // Importez le nouveau composant

const IndexPage = () => {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url('/ancient_white_magical_door.png')` }}
    >
      <h1 className="text-4xl font-bold text-gray-100 mb-8 relative z-10">
        Room of Requirement
      </h1>
      <div className="relative z-10">
        <LoginForm />
      </div>
      <WelcomeDialog /> {/* Ajout du composant WelcomeDialog ici */}
    </div>
  );
};

export default IndexPage;