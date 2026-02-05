import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4568', 10),
  host: process.env.HOST || 'localhost',
  storagePath: process.env.STORAGE_PATH || './storage',
};
