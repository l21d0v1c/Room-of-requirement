import { showError } from '@/utils/toast';

interface ThingData {
  name: string;
  fileContent: string; // Base64 encoded file
  magicWord: string;
  createdAt: number; // Timestamp of creation
  deleteAt: number; // Timestamp for scheduled deletion
}

const ROOM_STORAGE_KEY = 'room_of_requirement_things';

// Helper to get all things from localStorage, filtering out expired ones
const getThings = (): Record<string, ThingData> => {
  let things: Record<string, ThingData> = {};
  try {
    const thingsString = localStorage.getItem(ROOM_STORAGE_KEY);
    if (thingsString) {
      things = JSON.parse(thingsString);
    }
  } catch (error) {
    console.error("Error parsing things from localStorage:", error);
    showError("Erreur lors du chargement des objets.");
    return {}; // Return empty object on error
  }
  
  const now = Date.now();
  const activeThings: Record<string, ThingData> = {};
  let changed = false;

  for (const key in things) {
    const thing = things[key];
    // Validate structure and check expiration
    if (thing && typeof thing.deleteAt === 'number' && thing.deleteAt > now) {
      activeThings[key] = thing;
    } else {
      // If expired or malformed, mark for removal
      changed = true;
    }
  }

  // Only save if changes were made (expired items removed)
  if (changed) {
    saveThings(activeThings);
  }
  return activeThings;
};

// Helper to save all things to localStorage
const saveThings = (things: Record<string, ThingData>) => {
  try {
    localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(things));
  } catch (error) {
    console.error("Error saving things to localStorage:", error);
    showError("Erreur lors de la sauvegarde des objets.");
  }
};

// Public function to save a new thing
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
    deleteAt: Infinity, // Initially, no deletion scheduled until downloaded
  };
  things[normalizedName] = newThing;
  saveThings(things);
  return true;
};

// Public function to load a thing
export const loadThing = (name: string): ThingData | null => {
  const things = getThings();
  const normalizedName = name.toLowerCase();
  const thing = things[normalizedName];

  if (thing && thing.deleteAt <= Date.now()) {
    // If found but expired, delete it and return null
    delete things[normalizedName];
    saveThings(things);
    return null;
  }
  return thing || null;
};

// Public function to schedule deletion for a thing
export const scheduleThingDeletion = (name: string, days: number) => {
  const things = getThings();
  const normalizedName = name.toLowerCase();
  if (things[normalizedName]) {
    const deleteTimestamp = Date.now() + days * 24 * 60 * 60 * 1000; // days in milliseconds
    things[normalizedName].deleteAt = deleteTimestamp;
    saveThings(things);
  }
};

// Public function to check if a thing exists and is not expired
export const thingExists = (name: string): boolean => {
  const things = getThings();
  const normalizedName = name.toLowerCase();
  return !!things[normalizedName]; // getThings already filters expired items
};