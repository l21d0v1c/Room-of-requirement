import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { showError } from '@/utils/toast';

const HomePage = () => {
  const [thingName, setThingName] = useState('');
  const navigate = useNavigate();

  const handleAsk = () => {
    if (!thingName.trim()) {
      showError("Veuillez entrer un nom pour l'objet.");
      return;
    }
    navigate(`/thing/${encodeURIComponent(thingName.trim())}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Room of Requirement</CardTitle>
          <CardDescription>
            Demandez ce dont vous avez besoin, et la salle le fournira.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="thing-name">Nom de l'objet (Thing)</Label>
            <Input
              id="thing-name"
              type="text"
              placeholder="Ex: Épée de Gryffondor"
              value={thingName}
              onChange={(e) => setThingName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAsk();
                }
              }}
              required
            />
          </div>
          <Button type="submit" className="w-full" onClick={handleAsk}>
            Demander (Ask)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;