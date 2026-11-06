import { Decimal } from 'decimal.js';

interface MoneyProps {
  value: string,
  currency: string
}

class Money {
  private constructor(
    private readonly amount: Decimal,
    public readonly currency: string
  ) {}

  static from(props: MoneyProps): Money {
    if (!/^-?\d+\.\d{2}$/.test(props.value)) {
      throw new Error("Invalid monetary format");
    }
    if (!/^[A-Z]{3}$/.test(props.currency)) {
      throw new Error("Invalid currency");
    }

    return new Money(
      new Decimal(props.value),
      props.currency
    );
  }

  static zero(currency: MoneyProps['currency']): Money {
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new Error("Invalid currency");
    }

    return new Money(
      new Decimal(0),
      currency
    );
  }

  public add(other: Money): Money {
    this.assertSameCurrency(other);

    return new Money(
      this.amount.plus(other.amount),
      this.currency
    );
  }
  public subtract(other: Money): Money {
    this.assertSameCurrency(other);

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
    this.assertSameCurrency(other);

    return this.amount.greaterThan(other.amount);
  }
  public isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    
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

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error("Currency mismatch");
    }
  }
}

export default Money;