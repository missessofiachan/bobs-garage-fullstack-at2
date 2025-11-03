// Sequelize initialization with error handling and dynamic model loading
import { Sequelize } from 'sequelize-typescript';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
// Import model classes explicitly so they're registered regardless of runtime loader
import { User } from '../db/models/User.js';
import { Service } from '../db/models/Service.js';
import { Staff } from '../db/models/Staff.js';
import { Favorite } from '../db/models/Favorite.js';

/**
 * Creates and returns a Sequelize instance.
 * Explicitly registers model classes to avoid model initialization issues.
 */
export function createSequelizeInstance() {
  const sequelize = new Sequelize({
    database: env.DATABASE_NAME || 'bobs_garage',
    username: env.DATABASE_USER || 'root',
    password: env.DATABASE_PASSWORD || '',
    host: env.DATABASE_HOST || 'localhost',
    port: env.DATABASE_PORT || 3306,
    dialect: 'mysql',
    models: [User, Service, Staff, Favorite], // Explicit model registration
    logging: env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      min: env.DATABASE_POOL_MIN || 0,
      max: env.DATABASE_POOL_MAX || 5,
    },
  });

  // Test connection and log errors
  sequelize
    .authenticate()
    .then(() => {
      logger.info('Database connection established');
    })
    .catch((err) => {
      logger.error(`Unable to connect to the database: ${err}`);
    });

  return sequelize;
}

// Default export for convenience (can be replaced in tests)
export const sequelize = createSequelizeInstance();
