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
  try {
    const thingsString = localStorage.getItem(ROOM_STORAGE_KEY);
    const things: Record<string, ThingData> = thingsString ? JSON.parse(thingsString) : {};
    
    // Filter out expired things
    const now = Date.now();
    const activeThings: Record<string, ThingData> = {};
    for (const key in things) {
      if (things[key].deleteAt > now) {
        activeThings[key] = things[key];
      } else {
        console.log(`Thing '${key}' expired and removed.`);
      }
    }
    // Save the cleaned list back to localStorage
    localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(activeThings));
    return activeThings;
  } catch (error) {
    console.error("Error loading things from localStorage", error);
    showError("Erreur lors du chargement des objets.");
    return {};
  }
};

const saveThings = (things: Record<string, ThingData>) => {
  try {
    localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(things));
  } catch (error) {
    console.error("Error saving things to localStorage", error);
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
    // Initially, no deletion scheduled until downloaded
    deleteAt: Infinity, 
  };
  things[normalizedName] = newThing;
  saveThings(things);
  return true;
};

export const loadThing = (name: string): ThingData | null => {
  const things = getThings();
  const normalizedName = name.toLowerCase();
  const thing = things[normalizedName];

  if (thing && thing.deleteAt <= Date.now()) {
    // If it's expired, delete it and return null
    delete things[normalizedName];
    saveThings(things);
    return null;
  }
  return thing || null;
};

export const deleteThing = (name: string) => {
  const things = getThings();
  const normalizedName = name.toLowerCase();
  if (things[normalizedName]) {
    delete things[normalizedName];
    saveThings(things);
  }
};

export const scheduleThingDeletion = (name: string, days: number) => {
  const things = getThings();
  const normalizedName = name.toLowerCase();
  if (things[normalizedName]) {
    const deleteTimestamp = Date.now() + days * 24 * 60 * 60 * 1000; // days in milliseconds
    things[normalizedName].deleteAt = deleteTimestamp;
    saveThings(things);
  }
};

export const thingExists = (name: string): boolean => {
  const things = getThings();
  const normalizedName = name.toLowerCase();
  return !!things[normalizedName];
};