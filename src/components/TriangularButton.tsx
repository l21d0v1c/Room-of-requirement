"use client";

import React from 'react';
import { Button } from '@/components/ui/button'; // Utilise le Button de shadcn comme base
import { cn } from '@/lib/utils';

interface TriangularButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const TriangularButton = React.forwardRef<HTMLButtonElement, TriangularButtonProps>(
  ({ className, children, isLoading, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "relative",
          "w-32 h-24", // Taille fixe pour le triangle
          "flex items-center justify-center",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "p-0", // Supprime le padding par défaut pour mieux contrôler le texte
          "overflow-hidden", // Cache tout ce qui dépasse de la forme triangulaire
          className
        )}
        style={{
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', // Forme de triangle pointant vers le haut
        }}
        disabled={props.disabled || isLoading}
        {...props}
      >
        <span className="relative z-10 text-sm font-medium">
          {isLoading ? "Chargement..." : children}
        </span>
      </Button>
    );
  }
);
TriangularButton.displayName = "TriangularButton";

export default TriangularButton;