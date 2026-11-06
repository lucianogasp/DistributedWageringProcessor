import "dotenv/config";
import { DataSource } from "typeorm";

import WalletOrmEntity from "../wallet/infrastructure/typeorm/WalletOrmEntity";
import WagerTransactionOrmEntity from "../wagering/infrastructure/typeorm/WagerTransactionOrmEntity";
import WalletLedgerEntryOrmEntity from "../wallet/infrastructure/typeorm/WalletLedgerEntryOrmEntity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [
    WalletOrmEntity,
    WagerTransactionOrmEntity,
    WalletLedgerEntryOrmEntity,
  ],

  migrations: ["src/database/migrations/*.ts"],

  synchronize: false,
});

export default AppDataSource;