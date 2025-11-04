/**
 * @author Bob's Garage Team
 * @purpose Service database model for garage service offerings
 * @version 1.0.0
 */

import {
	AllowNull,
	AutoIncrement,
	Column,
	CreatedAt,
	DataType,
	Default,
	Index,
	Model,
	PrimaryKey,
	Table,
	UpdatedAt,
} from "sequelize-typescript";

@Table({
	tableName: "services",
	indexes: [
		{ fields: ["name"] }, // Index for search queries
		{ fields: ["published"] }, // Index for filtering by published status
		{ fields: ["price"] }, // Index for sorting by price
		{ fields: ["published", "price"] }, // Composite index for common query pattern
	],
})

// Service model for garage offerings
export class Service extends Model {
	// Primary key
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	declare id: number;

	// Service name (required)
	@AllowNull(false)
	@Column(DataType.STRING)
	declare name: string;

	// Service price (required, default: 0.00)
	@AllowNull(false)
	@Default(0.0)
	@Column(DataType.DECIMAL(10, 2))
	declare price: number;

	// Description (optional)
	@Column(DataType.TEXT)
	declare description: string;

	// Image URL (optional)
	@Column(DataType.STRING)
	declare imageUrl: string;

	// Published status (default: false)
	@AllowNull(false)
	@Default(false)
	@Column(DataType.BOOLEAN)
	declare published: boolean;

	// Timestamps
	@CreatedAt
	@Column(DataType.DATE)
	declare createdAt: Date;

	@UpdatedAt
	@Column(DataType.DATE)
	declare updatedAt: Date;
}
