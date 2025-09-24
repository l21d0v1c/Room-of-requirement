"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const WelcomeDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Ouvre le dialogue automatiquement au chargement du composant
    setIsOpen(true);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-100 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-100">Welcome, young wizard!</DialogTitle>
          <DialogDescription className="text-center text-gray-300 mt-2">
            You have stumbled upon the Room of Requirement.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center text-gray-200">
          <p className="mb-2">
            This room manifests itself only when one is in great need.
            Here, you can store or retrieve a single "thing" that you desperately require.
          </p>
          <p>
            Enter the "Thing" you need and a "Magic word" to evoke it.
            If it's your first time, the room will remember your request.
            If you return, it will present you with your stored item.
          </p>
        </div>
        <div className="flex justify-center">
          <Button onClick={() => setIsOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
            Enter the Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;