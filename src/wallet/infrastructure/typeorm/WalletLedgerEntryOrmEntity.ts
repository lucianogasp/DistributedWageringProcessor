import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from "typeorm";

import WalletOrmEntity from "./WalletOrmEntity";
import WagerTransactionOrmEntity from "../../../wagering/infrastructure/typeorm/WagerTransactionOrmEntity";
import LedgerDirection from "../../domain/WalletLedgerEntry";

@Entity("wallet_ledger_entries")
@Index(
  "UQ_ledger_transaction_wallet",
  ["transaction", "wallet"],
  { unique: true },
)
@Check("CHK_ledger_amount_positive", '"amount" > 0')
@Check(
  "CHK_ledger_balance_non_negative",
  '"balance_before" >= 0 AND "balance_after" >= 0',
)
@Check(
  "CHK_ledger_direction",
  `"direction" IN ('DEBIT', 'CREDIT')`,
)
@Check(
  "CHK_ledger_balance_consistency",
  `(
    ("direction" = 'CREDIT' AND "balance_after" = "balance_before" + "amount")
    OR
    ("direction" = 'DEBIT' AND "balance_after" = "balance_before" - "amount")
  )`,
)
class WalletLedgerEntryOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @ManyToOne(() => WalletOrmEntity, (wallet) => wallet.ledgerEntries, {
    nullable: false,
  })
  @JoinColumn({ name: "wallet_id" })
  wallet: WalletOrmEntity;

  @ManyToOne(
    () => WagerTransactionOrmEntity,
    (transaction) => transaction.ledgerEntries,
    { nullable: false },
  )
  @JoinColumn({ name: "transaction_id" })
  transaction: WagerTransactionOrmEntity;

  @Column({ type: "varchar", length: 6 })
  direction: LedgerDirection;

  @Column({ type: "numeric", precision: 20, scale: 2 })
  amount: string;

  @Column({ name: "balance_before", type: "numeric", precision: 20, scale: 2 })
  balanceBefore: string;

  @Column({ name: "balance_after", type: "numeric", precision: 20, scale: 2 })
  balanceAfter: string;

  @Column({ type: "varchar", length: 3 })
  currency: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;
}

export default WalletLedgerEntryOrmEntity;