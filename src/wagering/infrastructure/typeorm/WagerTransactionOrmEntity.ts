import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  RelationId,
} from "typeorm";

import WalletOrmEntity from "../../../wallet/infrastructure/typeorm/WalletOrmEntity";
import { WagerTransactionKind, WagerTransactionStatus } from "../../domain/WagerTransaction";
import WalletLedgerEntryOrmEntity from "../../../wallet/infrastructure/typeorm/WalletLedgerEntryOrmEntity";

@Entity("wager_transactions")
@Index(
  "UQ_wager_provider_external_transaction",
  ["providerId", "externalTransactionId"],
  { unique: true },
)
@Index(
  "UQ_wager_provider_idempotency_key",
  ["providerId", "idempotencyKey"],
  { unique: true },
)
class WagerTransactionOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ name: "provider_id", type: "varchar" })
  providerId: string;

  @Column({ name: "external_transaction_id", type: "varchar" })
  externalTransactionId: string;

  @Column({ name: "idempotency_key", type: "varchar" })
  idempotencyKey: string;

  @Column({ name: "payload_hash", type: "varchar" })
  payloadHash: string;

  @ManyToOne(() => WalletOrmEntity, (wallet) => wallet.transactions, {
    nullable: false,
  })
  @JoinColumn({ name: "wallet_id" })
  wallet: WalletOrmEntity;

  @RelationId((transaction: WagerTransactionOrmEntity) => transaction.wallet)
  walletId: string;

  @Column({ name: "player_id", type: "uuid" })
  playerId: string;

  @Column({ name: "round_id", type: "varchar" })
  roundId: string;

  @Column({ name: "game_id", type: "varchar" })
  gameId: string;

  @Column({ type: "varchar" })
  kind: WagerTransactionKind;

  @Column({ type: "numeric", precision: 20, scale: 2 })
  amount: string;

  @Column({ type: "varchar", length: 3 })
  currency: string;

  @Column({
    name: "reference_external_transaction_id",
    type: "varchar",
    nullable: true,
  })
  referenceExternalTransactionId: string | null;

  @ManyToOne(() => WagerTransactionOrmEntity, {
    nullable: true,
  })
  @JoinColumn({ name: "reference_transaction_id" })
  referenceTransaction: WagerTransactionOrmEntity | null;

  @RelationId(
    (transaction: WagerTransactionOrmEntity) =>
      transaction.referenceTransaction,
  )
  referenceTransactionId: string | null;

  @Column({ type: "varchar" })
  status: WagerTransactionStatus;

  @Column({ name: "failure_code", type: "varchar", nullable: true })
  failureCode: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @Column({ name: "processed_at", type: "timestamptz", nullable: true })
  processedAt: Date | null;

  @OneToMany(
    () => WalletLedgerEntryOrmEntity,
    (entry) => entry.transaction,
  )
  ledgerEntries: WalletLedgerEntryOrmEntity[];
}

export default WagerTransactionOrmEntity;