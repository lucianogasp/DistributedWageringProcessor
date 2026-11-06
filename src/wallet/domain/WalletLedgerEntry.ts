import Money from "../../shared/domain/Money";

export enum LedgerDirection { 
  Debit = "DEBIT", 
  Credit = "CREDIT" 
}

interface CreateLedgerEntryProps {
  id: string;
  walletId: string;
  transactionId: string;
  direction: LedgerDirection;
  money: Money;
  balanceBefore: Money;
  balanceAfter: Money;
}

interface LedgerEntryState {
  id: string;
  walletId: string;
  transactionId: string;
  direction: LedgerDirection;
  money: Money;
  balanceBefore: Money;
  balanceAfter: Money;
  createdAt: Date;
}

class WalletLedgerEntry {
  private constructor(
    public readonly id: string,
    public readonly walletId: string,
    public readonly transactionId: string,
    public readonly direction: LedgerDirection,
    public readonly money: Money,
    public readonly balanceBefore: Money,
    public readonly balanceAfter: Money,
    public readonly createdAt: Date,
  ) {}

  static create(props: CreateLedgerEntryProps): WalletLedgerEntry {
    this.validateCreation(props);

    const createdAt = new Date();

    const entry = new WalletLedgerEntry(
      props.id,
      props.walletId,
      props.transactionId,
      props.direction,
      props.money,
      props.balanceBefore,
      props.balanceAfter,
      createdAt,
    );

    if (!entry.isBalanced()) {
      throw new Error("Invalid ledger entry: unbalanced transaction");
    }

    return entry;
  }

  static rehydrate(state: LedgerEntryState): WalletLedgerEntry {
    return new WalletLedgerEntry(
      state.id,
      state.walletId,
      state.transactionId,
      state.direction,
      state.money,
      state.balanceBefore,
      state.balanceAfter,
      state.createdAt,
    );
  }

  public isBalanced(): boolean {
    let expectedBalance: Money;

    if (this.direction === LedgerDirection.Credit) {
      expectedBalance = this.balanceBefore.add(this.money);
    } else {
      expectedBalance = this.balanceBefore.subtract(this.money);
    }

    return expectedBalance.equals(this.balanceAfter);
  }

  private static validateCreation(
    props: CreateLedgerEntryProps,
  ): void {
    if (
      !props.id?.trim() ||
      !props.walletId?.trim() ||
      !props.transactionId?.trim()
    ) {
      throw new Error("Invalid ledger entry identifiers");
    }

    if (
      props.direction !== LedgerDirection.Credit &&
      props.direction !== LedgerDirection.Debit
    ) {
      throw new Error("Invalid ledger direction");
    }

    if (!props.money.isPositive()) {
      throw new Error("Ledger amount must be positive");
    }

    if (
      props.balanceBefore.isNegative() ||
      props.balanceAfter.isNegative()
    ) {
      throw new Error("Ledger balance cannot be negative");
    }

    if (
      props.money.currency !== props.balanceBefore.currency ||
      props.money.currency !== props.balanceAfter.currency
    ) {
      throw new Error("Currency mismatch in ledger entry");
    }
  }
}

export default WalletLedgerEntry;