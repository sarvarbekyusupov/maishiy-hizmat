import { Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

interface ICustomerCreationAttr {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  lang: string;
}

@Table({ tableName: "customer" })
export class Customer extends Model<Customer, ICustomerCreationAttr> {
  @PrimaryKey
  @Column({
    type: DataType.BIGINT,
  })
  declare user_id: number;

  @Column(DataType.STRING)
  declare username: string;

  @Column(DataType.STRING)
  declare first_name: string;

  @Column(DataType.STRING)
  declare last_name: string;

  @Column(DataType.STRING)
  declare phone_number: string;

  @Column(DataType.STRING)
  declare lang: string;
}
