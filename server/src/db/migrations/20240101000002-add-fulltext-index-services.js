/**
 * @file 20240101000002-add-fulltext-index-services.js
 * @author Bob's Garage Team
 * @description Migration to add full-text index on services table for better search
 * @version 1.0.0
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Add full-text index on name and description columns
		// Note: MySQL requires InnoDB engine (5.6+) for full-text indexes
		// If the index already exists, this will fail gracefully
		try {
			await queryInterface.sequelize.query(`
        ALTER TABLE services 
        ADD FULLTEXT INDEX ft_search (name, description)
      `);
		} catch (error) {
			// Index might already exist, check error message
			if (!error.message.includes("Duplicate key name")) {
				throw error;
			}
			console.log("Full-text index ft_search already exists, skipping...");
		}
	},

	async down(queryInterface, Sequelize) {
		// Remove full-text index
		await queryInterface.sequelize.query(`
      ALTER TABLE services 
      DROP INDEX ft_search
    `);
	},
};
