/**
 * @file AuditLog.ts
 * @author Bob's Garage Team
 * @description Sequelize TypeScript model for audit logging - tracks admin actions for compliance and security
 * @version 1.0.0
 * @since 1.0.0
 */

import {
	AllowNull,
	AutoIncrement,
	Column,
	CreatedAt,
	DataType,
	Index,
	Model,
	PrimaryKey,
	Table,
} from "sequelize-typescript";

export type AuditAction =
	| "create"
	| "update"
	| "delete"
	| "upload"
	| "login"
	| "logout"
	| "view"
	| "export"
	| "other";

export type AuditResource = "service" | "staff" | "user" | "favorite" | "system" | "other";

@Table({
	tableName: "audit_logs",
	indexes: [
		{ fields: ["userId"] },
		{ fields: ["action"] },
		{ fields: ["resource"] },
		{ fields: ["resourceId"] },
		{ fields: ["createdAt"] },
		{ fields: ["userId", "action"] },
		{ fields: ["resource", "resourceId"] },
	],
})
export class AuditLog extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	declare id: number;

	// User who performed the action (null for system actions)
	@AllowNull(true)
	@Column(DataType.INTEGER)
	declare userId: number | null;

	// User email for quick reference (denormalized)
	@AllowNull(true)
	@Column(DataType.STRING)
	declare userEmail: string | null;

	// Action performed
	@AllowNull(false)
	@Column(DataType.STRING)
	declare action: AuditAction;

	// Resource type (e.g., "service", "staff", "user")
	@AllowNull(false)
	@Column(DataType.STRING)
	declare resource: AuditResource;

	// Resource ID (e.g., service ID, staff ID)
	@AllowNull(true)
	@Column(DataType.INTEGER)
	declare resourceId: number | null;

	// Description of the action
	@AllowNull(false)
	@Column(DataType.TEXT)
	declare description: string;

	// Previous state (JSON) - for updates/deletes
	@AllowNull(true)
	@Column(DataType.TEXT)
	declare previousState: string | null;

	// New state (JSON) - for creates/updates
	@AllowNull(true)
	@Column(DataType.TEXT)
	declare newState: string | null;

	// IP address of the request
	@AllowNull(true)
	@Column(DataType.STRING)
	declare ipAddress: string | null;

	// User agent
	@AllowNull(true)
	@Column(DataType.STRING)
	declare userAgent: string | null;

	// Request ID for tracing
	@AllowNull(true)
	@Column(DataType.STRING)
	declare requestId: string | null;

	// Timestamp
	@CreatedAt
	@Index
	@Column(DataType.DATE)
	declare createdAt: Date;
}
