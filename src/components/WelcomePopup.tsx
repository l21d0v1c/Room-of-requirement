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
          <DialogTitle className="text-2xl font-bold text-center">Welcome to the room of requirement !</DialogTitle>
          <DialogDescription className="text-center text-gray-300 mt-2">
            Write a "Thing" and a "Magic word", then click on "Evoke" to enter.
            <br /><br />
            Click on "Load a thing" to upload a secret file, then click on "Quit the room" to leave the room.
            <br /><br />
            You or another wizard will be able to retrieve the object — if they have the correct "Thing" and "Magic word" — by clicking again on "Evoke", then on "Load the thing".
            <br /><br />
            Once the "Thing" is downloaded, all traces of your presence will be erased within two days, as if you had never come, never written anything, and never downloaded anything.
            <br /><br />
            Your mischief will be managed.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button onClick={() => setIsOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-gray-100">
            Yes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;