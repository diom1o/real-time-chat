require('dotenv').config();

const configCache = {};

const getConfig = (env) => {
  if (configCache[env]) {
    return configCache[env];
  }
  
  const config = {
    PORT: process.env.PORT || 3000,
    DATABASE_URL: process.env[`${env}_DATABASE_URL`],
    API_KEY: process.env[`${env}_API_KEY`],
  };
  
  configCache[env] = config;
  
  return config;
};

const ENVIRONMENT = process.env.NODE_ENV ? process.env.NODE_ENV.toUpperCase() : 'DEVELOPMENT';
const finalConfig = getConfig(ENVIRONMENT);

module.exports = finalConfig;