import Money from "../money/Money";

type WalletProps = {
  id: string,
  playerId: string,
  currency: string,
  balance: Money,
  version: number,
  createdAt: Date,
  updatedAt: Date
}

class Wallet {
  
  private constructor(
    public readonly id: string,
    public readonly playerId: string,
    public readonly currency: string,
    private _balance: Money,
    private _version: number,
    public readonly createdAt: Date,
    private _updatedAt: Date
  ) {
    if (_balance.currency !== currency) {
      throw new Error('Currency mismatch');
    }

    if (_balance.isNegative()) {
      throw new Error("Balance cannot be negative");
    }

    if (!Number.isInteger(_version) || _version < 1) {
      throw new Error("Invalid wallet version");
    }
  }

  get balance(): Money { return this._balance }

  get version(): number { return this._version }

  get updateAt(): Date { return this._updatedAt }

  static create(props: Pick<WalletProps, 'id' | 'playerId' | 'currency' | 'balance'>): Wallet {
    const version = 1;
    const now = new Date();

    return new Wallet(
      props.id,
      props.playerId,
      props.currency,
      props.balance,
      version,
      now,
      now
    );
  }

  static reconstitute(props: WalletProps): Wallet {
    return new Wallet(
      props.id,
      props.playerId,
      props.currency,
      props.balance,
      props.version,
      props.createdAt,
      props.updatedAt
    );
  }

  public debit(amount: Money): void {
    if(!amount.isPositive()) {
      throw new Error('Amount must be positive');
    }
    if(!amount.isGreaterThan(this._balance)) {
      throw new Error('Insuficient balance');
    }

    this._balance = this._balance.subtract(amount);
    this._version++;
    this._updatedAt = new Date();
  }

  public credit(amount: Money): void {
    if(!amount.isPositive()) {
      throw new Error('Amount must be positive');
    }

    this._balance = this._balance.add(amount);
    this._version++;
    this._updatedAt = new Date();
  }
}

export default Wallet;