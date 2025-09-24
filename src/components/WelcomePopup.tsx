"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Vérifie si l'utilisateur a déjà vu le pop-up
    const hasSeenPopup = localStorage.getItem('hasSeenWelcomePopup');
    if (!hasSeenPopup) {
      setIsOpen(true);
      // Marque le pop-up comme vu pour ne pas le montrer à nouveau
      localStorage.setItem('hasSeenWelcomePopup', 'true');
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-100 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Bienvenue dans la Salle sur Demande !</DialogTitle>
          <DialogDescription className="text-center text-gray-300 mt-2">
            Ici, vous pouvez stocker et récupérer votre "chose" secrète.
            Utilisez votre "Thing" et votre "Magic word" pour entrer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button onClick={() => setIsOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-gray-100">
            Compris !
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;