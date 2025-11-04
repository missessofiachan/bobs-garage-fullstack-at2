/**
 * @author Bob's Garage Team
 * @purpose Sequelize ORM initialization and configuration with model registration
 * @version 1.0.0
 */

// Sequelize initialization with error handling and dynamic model loading
import { Sequelize } from "sequelize-typescript";
import { Favorite } from "../db/models/Favorite.js";
import { Service } from "../db/models/Service.js";
import { Staff } from "../db/models/Staff.js";
// Import model classes explicitly so they're registered regardless of runtime loader
import { User } from "../db/models/User.js";
import { logger } from "../utils/logger.js";
import { env } from "./env.js";

/**
 * Creates and returns a Sequelize instance.
 * Explicitly registers model classes to avoid model initialization issues.
 */
export function createSequelizeInstance() {
	const sequelize = new Sequelize({
		database: env.DATABASE_NAME || "bobs_garage",
		username: env.DATABASE_USER || "root",
		password: env.DATABASE_PASSWORD || "",
		host: env.DATABASE_HOST || "localhost",
		port: env.DATABASE_PORT || 3306,
		dialect: "mysql",
		models: [User, Service, Staff, Favorite], // Explicit model registration
		logging: env.NODE_ENV === "development" ? console.log : false,
		pool: {
			min: env.DATABASE_POOL_MIN || 0,
			max: env.DATABASE_POOL_MAX || 5,
			acquire: 30000, // Maximum time in ms to try getting connection before throwing error
			idle: 10000, // Maximum time in ms that a connection can be idle before being released
			evict: 1000, // Interval in ms to check for idle connections
		},
	});

	// Test connection and log errors
	sequelize
		.authenticate()
		.then(() => {
			logger.info("Database connection established");
		})
		.catch((err) => {
			logger.error(`Unable to connect to the database: ${err}`);
		});

	return sequelize;
}

// Default export for convenience (can be replaced in tests)
export const sequelize = createSequelizeInstance();
