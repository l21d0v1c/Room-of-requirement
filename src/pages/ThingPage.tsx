import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { saveThing, loadThing, thingExists, scheduleThingDeletion } from '@/utils/roomStorage';

const ThingPage = () => {
  const { thingName: encodedThingName } = useParams<{ thingName: string }>();
  const thingName = encodedThingName ? decodeURIComponent(encodedThingName) : '';
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [magicWord, setMagicWord] = useState('');
  const [isExistingThing, setIsExistingThing] = useState(false);
  const [showMagicWordInput, setShowMagicWordInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!thingName) {
      navigate('/');
      return;
    }
    const exists = thingExists(thingName);
    setIsExistingThing(exists);
    if (exists) {
      setShowMagicWordInput(true); // If thing exists, go straight to magic word
    }
  }, [thingName, navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setShowMagicWordInput(true);
    }
  };

  const handleLoadThingClick = () => {
    fileInputRef.current?.click();
  };

  const handleEvoke = async () => {
    if (!thingName) {
      showError("Nom de l'objet manquant.");
      navigate('/');
      return;
    }
    if (!magicWord.trim()) {
      showError("Veuillez entrer le mot magique.");
      return;
    }

    if (isExistingThing) {
      // User is trying to evoke an existing thing
      const storedThing = loadThing(thingName);
      if (!storedThing) {
        showError("L'objet n'existe plus ou a expiré.");
        navigate('/');
        return;
      }

      if (storedThing.magicWord === magicWord.trim()) {
        showSuccess("Mot magique correct ! Téléchargement de l'objet...");
        
        // Trigger file download
        const byteCharacters = atob(storedThing.fileContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/octet-stream' }); // Generic type
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = storedThing.name; // Use the thing name as the download filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showSuccess("L'objet disparaîtra dans deux jours.");
        scheduleThingDeletion(thingName, 2); // Schedule deletion for 2 days later
        
        // After download, redirect to homepage
        setTimeout(() => navigate('/'), 3000);

      } else {
        showError("Mot magique incorrect.");
        navigate('/');
      }
    } else {
      // User is trying to save a new thing
      if (!file) {
        showError("Veuillez télécharger un fichier.");
        navigate('/');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64Content = fileContent.split(',')[1];

        if (saveThing(thingName, base64Content, magicWord.trim())) {
          showSuccess("Objet enregistré avec succès !");
          navigate('/');
        } else {
          // Error message already shown by saveThing
          navigate('/');
        }
      };
      reader.onerror = () => {
        showError("Erreur lors de la lecture du fichier.");
        navigate('/');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Room of Requirement</CardTitle>
          <CardDescription>
            {isExistingThing ? `Évoquez l'objet "${thingName}"` : `Créez l'objet "${thingName}"`}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!isExistingThing && !file && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button className="w-full" onClick={handleLoadThingClick}>
                Charger un objet (Load a thing)
              </Button>
            </>
          )}

          {(file || isExistingThing || showMagicWordInput) && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="magic-word">Mot magique (Magic Word)</Label>
                <Input
                  id="magic-word"
                  type="password"
                  value={magicWord}
                  onChange={(e) => setMagicWord(e.target.value)}
                  placeholder="Entrez votre mot magique"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleEvoke();
                    }
                  }}
                  required
                />
              </div>
              <Button type="submit" className="w-full" onClick={handleEvoke}>
                Évoquer (Evoke)
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ThingPage;