export const getEnv = (key: string, defaultVal: string = "") => {
  const val = process.env[key] ?? defaultVal;
  if (!val) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return val;
};
