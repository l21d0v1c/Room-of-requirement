import { showError } from '@/utils/toast';

interface ThingData {
  name: string;
  fileContent: string; // Base64 encoded file
  magicWord: string;
  createdAt: number; // Timestamp of creation
  deleteAt: number; // Timestamp for scheduled deletion
}

const ROOM_STORAGE_KEY = 'room_of_requirement_things';

const getThings = (): Record<string, ThingData> => {
  let things: Record<string, ThingData> = {};
  try {
    const thingsString = localStorage.getItem(ROOM_STORAGE_KEY);
    console.log("roomStorage: Raw thingsString from localStorage:", thingsString);
    if (thingsString) {
      things = JSON.parse(thingsString);
      console.log("roomStorage: Parsed things from localStorage:", things);
    }
  } catch (error) {
    console.error("roomStorage: Error parsing things from localStorage", error);
    showError("Erreur lors du chargement des objets.");
    things = {}; 
  }
  
  const now = Date.now();
  const activeThings: Record<string, ThingData> = {};
  for (const key in things) {
    if (things[key] && typeof things[key].deleteAt === 'number' && things[key].deleteAt > now) {
      activeThings[key] = things[key];
    } else {
      if (things[key] && typeof things[key].deleteAt === 'number') {
        console.log(`roomStorage: Thing '${key}' expired (deleteAt: ${new Date(things[key].deleteAt).toLocaleString()}) and removed.`);
      } else {
        console.warn(`roomStorage: Thing '${key}' found in storage but malformed or missing deleteAt. Removing.`);
      }
    }
  }
  console.log("roomStorage: Active things after filtering:", activeThings);
  saveThings(activeThings); 
  return activeThings;
};

const saveThings = (things: Record<string, ThingData>) => {
  try {
    localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(things));
    console.log("roomStorage: Saved things to localStorage:", things);
  } catch (error) {
    console.error("roomStorage: Error saving things to localStorage", error);
    showError("Erreur lors de la sauvegarde des objets.");
  }
};

export const saveThing = (name: string, fileContent: string, magicWord: string): boolean => {
  const things = getThings();
  const normalizedName = name.toLowerCase();
  if (things[normalizedName]) {
    showError("Un objet avec ce nom existe déjà.");
    return false;
  }

  const now = Date.now();
  const newThing: ThingData = {
    name,
    fileContent,
    magicWord,
    createdAt: now,
    deleteAt: Infinity, 
  };
  things[normalizedName] = newThing;
  saveThings(things);
  console.log(`roomStorage: Thing '${name}' saved with deleteAt: Infinity`);
  return true;
};

export const loadThing = (name: string): ThingData | null => {
  const things = getThings();
  const normalizedName = name.toLowerCase();
  const thing = things[normalizedName];

  if (thing && thing.deleteAt <= Date.now()) {
    console.log(`roomStorage: Thing '${name}' found but expired during load. Deleting.`);
    delete things[normalizedName];
    saveThings(things);
    return null;
  }
  console.log(`roomStorage: Loaded thing '${name}':`, thing);
  return thing || null;
};

export const deleteThing = (name: string) => {
  const things = getThings();
  const normalizedName = name.toLowerCase();
  if (things[normalizedName]) {
    delete things[normalizedName];
    saveThings(things);
    console.log(`roomStorage: Thing '${name}' deleted.`);
  }
};

export const scheduleThingDeletion = (name: string, days: number) => {
  const things = getThings();
  const normalizedName = name.toLowerCase();
  if (things[normalizedName]) {
    const deleteTimestamp = Date.now() + days * 24 * 60 * 60 * 1000; // days in milliseconds
    things[normalizedName].deleteAt = deleteTimestamp;
    saveThings(things);
    console.log(`roomStorage: Thing '${name}' scheduled for deletion at: ${new Date(deleteTimestamp).toLocaleString()}`);
  }
};

export const thingExists = (name: string): boolean => {
  const things = getThings();
  const normalizedName = name.toLowerCase();
  const exists = !!things[normalizedName];
  console.log(`roomStorage: Checking existence for '${name}' (normalized: '${normalizedName}'). Exists: ${exists}`);
  return exists;
};