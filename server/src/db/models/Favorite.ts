/**
 * @author Bob's Garage Team
 * @purpose Favorite model for user-service favorites relationship
 * @version 1.0.0
 */

import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  CreatedAt,
} from 'sequelize-typescript';
import { User } from './User.js';
import { Service } from './Service.js';

@Table({ 
  tableName: 'favorites',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'serviceId']
    }
  ]
})
export class Favorite extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare userId: number;

  @ForeignKey(() => Service)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare serviceId: number;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  // Relationships
  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Service)
  declare service: Service;
}

