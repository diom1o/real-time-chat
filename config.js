require('dotenv').config();
const config = {
  common: {
    PORT: process.env.PORT || 3000,
  },
  development: {
    DATABASE_URL: process.env.DEVELOPMENT_DATABASE_URL,
    API_KEY: process.env.DEVELOPMENT_API_KEY,
  },
  production: {
    DATABASE_URL: process.env.PRODUCTION_DATABASE_URL,
    API_KEY: process.env.PRODUCTION_API_KEY,
  }
};
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const finalConfig = {
  ...config.common,
  ...(config[ENVIRONMENT] || {}),
};
module.exports = finalConfig;