interface NinaConfig {
  passwordHash: string;
  safeword: string;
  safecommand: string;
}

const CONFIG_KEY = 'nina_config';

export const saveConfig = (config: NinaConfig) => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error saving configuration to localStorage", error);
  }
};

export const loadConfig = (): NinaConfig | null => {
  try {
    const configString = localStorage.getItem(CONFIG_KEY);
    return configString ? JSON.parse(configString) : null;
  } catch (error) {
    console.error("Error loading configuration from localStorage", error);
    return null;
  }
};

export const clearConfig = () => {
  try {
    localStorage.removeItem(CONFIG_KEY);
  } catch (error) {
    console.error("Error clearing configuration from localStorage", error);
  }
};