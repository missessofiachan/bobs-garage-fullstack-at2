
// Sequelize initialization with error handling and dynamic model loading
import { Sequelize } from 'sequelize-typescript';
import { env } from './env.js';
// Import model classes explicitly so they're registered regardless of runtime loader
import { User } from '../db/models/User.js';
import { Service } from '../db/models/Service.js';
import { Staff } from '../db/models/Staff.js';

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
    models: [User, Service, Staff], // Explicit model registration
    logging: env.NODE_ENV === 'development' ? console.log : false,
  });

  // Test connection and log errors
  sequelize.authenticate()
    .then(() => {
      if (env.NODE_ENV === 'development') {
        console.log('Database connection established.');
      }
    })
    .catch((err) => {
      console.error('Unable to connect to the database:', err);
    });

  return sequelize;
}

// Default export for convenience (can be replaced in tests)
export const sequelize = createSequelizeInstance();
