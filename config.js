require('dotenv').config();

const getConfig = (env) => ({
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env[`${env}_DATABASE_URL`],
  API_KEY: process.env[`${env}_API_KEY`],
});

const ENVIRONMENT = process.env.NODE_ENV ? process.env.NODE_ENV.toUpperCase() : 'DEVELOPMENT';
const finalConfig = getConfig(ENVIRONMENT);

module.exports = finalConfig;