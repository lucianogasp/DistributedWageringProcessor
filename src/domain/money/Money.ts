import { Decimal } from 'decimal.js';

class Money {
  private constructor(
    private readonly amount: Decimal,
    private readonly currency: string
  ) {}

  static from(
    value: string,
    currency: string
  ): Money {
    if (!/^-?\d+\.\d{2}$/.test(value)) {
      throw new Error("Invalid monetary format");
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new Error("Invalid currency");
    }

    return new Money(
      new Decimal(value),
      currency
    );
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error("Currency mismatch");
    }
  }

  public add(other: Money): Money {
    this.ensureSameCurrency(other);

    return new Money(
      this.amount.plus(other.amount),
      this.currency
    );
  }
  public subtract(other: Money): Money {
    this.ensureSameCurrency(other);

    return new Money(
      this.amount.minus(other.amount),
      this.currency
    );
  }
  public negate(): Money {
    return new Money(
      this.amount.negated(),
      this.currency
    );
  }
  public isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);

    return this.amount.greaterThan(other.amount);
  }
  public isLessThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    
    return this.amount.lessThan(other.amount);
  }
  public equals(other: Money): boolean {
    return (
      this.currency === other.currency &&
      this.amount.equals(other.amount)
    );
  }
  public isPositive(): boolean {
    return this.amount.greaterThan(0);
  }
  public isNegative(): boolean {
    return this.amount.lessThan(0);
  }
  public isZero(): boolean {
    return this.amount.isZero();
  }
}

export default Money;