interface NinaConfig {
  passwordHash: string; // In a real app, this would be a proper hash
  safeword: string;
  safecommand: string;
}

const CONFIG_KEY = 'ninaConfig';

export const saveConfig = (config: NinaConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const loadConfig = (): NinaConfig | null => {
  const configString = localStorage.getItem(CONFIG_KEY);
  return configString ? JSON.parse(configString) : null;
};

export const clearConfig = () => {
  localStorage.removeItem(CONFIG_KEY);
};