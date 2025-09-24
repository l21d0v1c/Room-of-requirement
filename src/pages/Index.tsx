import React from 'react';
import LoginForm from '@/components/LoginForm';

const IndexPage = () => {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url('/ancient_white_magical_door.png')` }}
    >
      {/* Overlay pour améliorer la lisibilité du texte sur l'image */}
      <div className="absolute inset-0 bg-black opacity-50"></div> 
      <h1 className="text-4xl font-bold text-gray-100 mb-8 relative z-10">
        Room of Requirement
      </h1>
      <div className="relative z-10">
        <LoginForm />
      </div>
    </div>
  );
};

export default IndexPage;