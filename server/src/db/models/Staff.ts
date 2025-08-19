import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, AllowNull, Default, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'staff' })
export class Staff extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.STRING)
  declare role: string;

  @Column(DataType.TEXT)
  declare bio: string;

  @Column(DataType.STRING)
  declare photoUrl: string;

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  declare active: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;
}
