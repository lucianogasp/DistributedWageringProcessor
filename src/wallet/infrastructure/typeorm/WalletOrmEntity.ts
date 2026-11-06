import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Check,
  OneToMany
} from "typeorm";
import WagerTransactionOrmEntity from "../../../wagering/infrastructure/typeorm/WagerTransactionOrmEntity";
import WalletLedgerEntryOrmEntity from "./WalletLedgerEntryOrmEntity";

@Entity("wallets")
@Unique("UQ_wallet_player_currency", ["playerId", "currency"])
@Check("CHK_wallet_balance_non_negative", '"balance" >= 0')
@Check("CHK_wallet_version_positive", '"version" >= 1')
class WalletOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ name: "player_id", type: "uuid" })
  playerId: string;

  @Column({ type: "varchar", length: 3 })
  currency: string;

  @Column({ type: "numeric", precision: 20, scale: 2 })
  balance: string;

  @Column({ type: "integer" })
  version: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;

  @OneToMany(
    () => WagerTransactionOrmEntity,
    (transaction) => transaction.wallet,
  )
  transactions: WagerTransactionOrmEntity[];

  @OneToMany(
    () => WalletLedgerEntryOrmEntity,
    (entry) => entry.wallet,
)
ledgerEntries: WalletLedgerEntryOrmEntity[];
}

export default WalletOrmEntity;