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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log(`ThingPage: useEffect triggered for thingName: "${thingName}"`);
    if (!thingName) {
      console.log("ThingPage: thingName is empty, navigating to /");
      navigate('/');
      return;
    }
    
    setFile(null); 
    setMagicWord(''); 

    const exists = thingExists(thingName);
    console.log(`ThingPage: thingExists("${thingName}") returned: ${exists}`);
    setIsExistingThing(exists);
  }, [thingName, navigate]);

  // Log the state for debugging rendering
  useEffect(() => {
    console.log(`ThingPage: Current state - isExistingThing: ${isExistingThing}, file: ${!!file}`);
  }, [isExistingThing, file]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      console.log("ThingPage: File selected:", event.target.files[0].name);
      setFile(event.target.files[0]);
    }
  };

  const handleLoadThingClick = () => {
    console.log("ThingPage: 'Charger un objet' button clicked.");
    fileInputRef.current?.click();
  };

  const handleEvoke = async () => {
    console.log("ThingPage: 'Evoke' button clicked.");
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
      console.log(`ThingPage: Attempting to evoke existing thing "${thingName}"`);
      const storedThing = loadThing(thingName);
      if (!storedThing) {
        showError("L'objet n'existe plus ou a expiré.");
        navigate('/');
        return;
      }

      if (storedThing.magicWord === magicWord.trim()) {
        showSuccess("Mot magique correct ! Téléchargement de l'objet...");
        
        const byteCharacters = atob(storedThing.fileContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/octet-stream' }); 
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = storedThing.name; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showSuccess("L'objet disparaîtra dans deux jours.");
        scheduleThingDeletion(thingName, 2); 
        
        setTimeout(() => navigate('/'), 3000);

      } else {
        showError("Mot magique incorrect.");
        navigate('/');
      }
    } else {
      console.log(`ThingPage: Attempting to save new thing "${thingName}"`);
      if (!file) {
        showError("Veuillez télécharger un fichier.");
        navigate('/');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        const base64Content = fileContent.split(',')[1];

        if (saveThing(thingName, base64Content, magicWord.trim())) {
          showSuccess("Objet enregistré avec succès !");
          navigate('/');
        } else {
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
          {/* Condition pour afficher le bouton 'Charger un objet' */}
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

          {/* Condition pour afficher le champ 'Mot magique' et le bouton 'Évoquer' */}
          {(isExistingThing || file) && (
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