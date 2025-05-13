import {
  Column,
  DataType,
  Model,
  Table,
  PrimaryKey,
} from "sequelize-typescript";

export interface MasterCreationAttrs {
  user_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  lang?: string;
  phone_number?: string;
  last_state?: string;
}

@Table({ tableName: "masters" })
export class Master extends Model<Master, MasterCreationAttrs> {
  @PrimaryKey
  @Column({ type: DataType.BIGINT })
  user_id: number;

  @Column
  username: string;

  @Column
  first_name: string;

  @Column
  last_name: string;

  @Column
  lang: string;

  @Column
  phone_number: string;

  @Column
  last_state: string;
}
