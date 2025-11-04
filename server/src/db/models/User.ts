/**
 * @file User.ts
 * @author Bob's Garage Team
 * @description Sequelize TypeScript model representing the users table. Defines user schema with
 *              email, password hash, role (user/admin), and active status for authentication and authorization.
 * @version 1.0.0
 * @since 1.0.0
 */

import {
	AllowNull,
	AutoIncrement,
	Column,
	CreatedAt,
	DataType,
	Default,
	Model,
	PrimaryKey,
	Table,
	Unique,
	UpdatedAt,
} from "sequelize-typescript";

@Table({ tableName: "users" })

// User model for authentication and authorization
export class User extends Model {
	// Primary key
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	declare id: number;

	// User email (unique, required)
	@Unique
	@AllowNull(false)
	@Column(DataType.STRING)
	declare email: string;

	// Hashed password (required)
	@AllowNull(false)
	@Column(DataType.STRING)
	declare passwordHash: string;

	// User role (default: 'user')
	@Default("user")
	@AllowNull(false)
	@Column(DataType.STRING)
	declare role: "user" | "admin";

	// Active status (default: true)
	@Default(true)
	@AllowNull(false)
	@Column(DataType.BOOLEAN)
	declare active: boolean;

	// Timestamps
	@CreatedAt
	@Column(DataType.DATE)
	declare createdAt: Date;

	@UpdatedAt
	@Column(DataType.DATE)
	declare updatedAt: Date;
}
