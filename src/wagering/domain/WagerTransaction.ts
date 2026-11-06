import Money from "../../shared/domain/Money";
import { LedgerDirection } from "../../wallet/domain/WalletLedgerEntry";

enum WagerTransactionKind {
  Opening = "OPENING",
  Bet = "BET",
  Win = "WIN",
  Loss = "LOSS",
  Refund = "REFUND",
  Rollback = "ROLLBACK",
}

enum WagerTransactionStatus {
  Pending = "PENDING",
  PendingReference = "PENDING_REFERENCE",
  Processed = "PROCESSED",
  Rejected = "REJECTED",
  Failed = "FAILED",
}

enum FailureCode {
  InsufficientBalance = "INSUFFICIENT_BALANCE",
  InvalidReference = "INVALID_REFERENCE",
  AlreadyReversed = "ALREADY_REVERSED",
  CurrencyMismatch = "CURRENCY_MISMATCH",
  InvalidAmount = "INVALID_AMOUNT",
}

interface CreateWagerTransactionProps {
  id: string;
  providerId: string;
  externalTransactionId: string;
  idempotencyKey: string;
  payloadHash: string;
  walletId: string;
  playerId: string;
  roundId: string;
  gameId: string;
  kind: WagerTransactionKind;
  money: Money;
  referenceExternalTransactionId?: string;
}

interface WagerTransactionState {
  id: string;
  providerId: string;
  externalTransactionId: string;
  idempotencyKey: string;
  payloadHash: string;
  walletId: string;
  playerId: string;
  roundId: string;
  gameId: string;
  kind: WagerTransactionKind;
  money: Money;
  referenceExternalTransactionId?: string;
  createdAt: Date;

  status: WagerTransactionStatus;
  referenceTransactionId?: string;
  failureCode?: FailureCode;
  processedAt?: Date;
}

class WagerTransaction {
  private constructor(
    public readonly id: string,
    public readonly providerId: string,
    public readonly externalTransactionId: string,
    public readonly idempotencyKey: string,
    public readonly payloadHash: string,
    public readonly walletId: string,
    public readonly playerId: string,
    public readonly roundId: string,
    public readonly gameId: string,
    public readonly kind: WagerTransactionKind,
    public readonly money: Money,
    public readonly referenceExternalTransactionId: string | undefined,
    public readonly createdAt: Date,
    private _status: WagerTransactionStatus,
    private _referenceTransactionId?: string,
    private _failureCode?: FailureCode,
    private _processedAt?: Date,
  ) {}

  get status(): WagerTransactionStatus { return this._status; }

  get referenceTransactionId(): string | undefined { return this._referenceTransactionId; }

  get failureCode(): FailureCode | undefined { return this._failureCode; }

  get processedAt(): Date | undefined { return this._processedAt; }

  static create(props: CreateWagerTransactionProps): WagerTransaction {
    this.validateCreation(props);

    return new WagerTransaction(
      props.id,
      props.providerId,
      props.externalTransactionId,
      props.idempotencyKey,
      props.payloadHash,
      props.walletId,
      props.playerId,
      props.roundId,
      props.gameId,
      props.kind,
      props.money,
      props.referenceExternalTransactionId,
      new Date(),
      WagerTransactionStatus.Pending,
    );
  }

  static rehydrate(state: WagerTransactionState): WagerTransaction {
    this.validateState(state);

    return new WagerTransaction(
      state.id,
      state.providerId,
      state.externalTransactionId,
      state.idempotencyKey,
      state.payloadHash,
      state.walletId,
      state.playerId,
      state.roundId,
      state.gameId,
      state.kind,
      state.money,
      state.referenceExternalTransactionId,
      state.createdAt,
      state.status,
      state.referenceTransactionId,
      state.failureCode,
      state.processedAt,
    );
  }

  private static validateCreation(
    props: CreateWagerTransactionProps,
  ): void {
    const requiredFields = [
      props.id,
      props.providerId,
      props.externalTransactionId,
      props.idempotencyKey,
      props.payloadHash,
      props.walletId,
      props.playerId,
      props.roundId,
      props.gameId,
    ];

    if (requiredFields.some((field) => !field?.trim())) {
      throw new Error("Required transaction fields cannot be empty");
    }

    if (!props.money.isPositive()) {
      throw new Error("Transaction amount must be positive");
    }

    if (
      props.referenceExternalTransactionId !== undefined &&
      !props.referenceExternalTransactionId.trim()
    ) {
      throw new Error("Reference transaction ID cannot be empty");
    }

    const requiresReference =
      props.kind === WagerTransactionKind.Refund ||
      props.kind === WagerTransactionKind.Rollback;

    if (
      requiresReference &&
      props.referenceExternalTransactionId === undefined
    ) {
      throw new Error(
        "This transaction kind requires a reference transaction",
      );
    }

    if (
      props.kind !== WagerTransactionKind.Refund &&
      props.kind !== WagerTransactionKind.Rollback &&
      props.kind !== WagerTransactionKind.Win &&
      props.referenceExternalTransactionId !== undefined
    ) {
      throw new Error(
        "This transaction kind does not accept a reference transaction",
      );
    }
  }

  private static validateState(state: WagerTransactionState): void {
    if (!state.id?.trim()) {
      throw new Error("Transaction ID cannot be empty");
    }

    if (!state.createdAt || Number.isNaN(state.createdAt.getTime())) {
      throw new Error("Invalid transaction creation date");
    }

    if (!state.money.isPositive()) {
      throw new Error("Transaction amount must be positive");
    }

    const requiresReference =
      state.kind === WagerTransactionKind.Refund ||
      state.kind === WagerTransactionKind.Rollback;

    if (
      requiresReference &&
      !state.referenceExternalTransactionId?.trim()
    ) {
      throw new Error(
        "This transaction kind requires a reference transaction",
      );
    }
  }

  // ==================================================================================================================================================================

  public markProcessed(referenceTransactionId: string | undefined, at: Date ): void {
    this.validateTerminalTransactionState();
    
    if (this._status === WagerTransactionStatus.Pending || this._status === WagerTransactionStatus.PendingReference) {
      this._status = WagerTransactionStatus.Processed;
    }

    if (
      this.requiresReference() &&
      !referenceTransactionId?.trim()
    ) {
      throw new Error("Transaction requires a reference");
    }

    this._status = WagerTransactionStatus.Processed;
    this._referenceTransactionId = referenceTransactionId;
    this._processedAt = at;
  }

  public markPendingReference(): void {
    this.validateTerminalTransactionState();

    if (!this.referenceExternalTransactionId) {
      throw new Error("Transaction has no external reference");
    }

    this._status = WagerTransactionStatus.PendingReference;    
  }

  public reject(code: FailureCode): void {
    this.validateTerminalTransactionState();

    this._status = WagerTransactionStatus.Rejected;
    this._failureCode = code;
  }

  public fail(code: FailureCode): void {
    this.validateTerminalTransactionState();

    this._status = WagerTransactionStatus.Failed;
    this._failureCode = code;
  }

  private validateTerminalTransactionState(): void {
    if (
      this._status === WagerTransactionStatus.Processed || 
      this._status === WagerTransactionStatus.Rejected || 
      this._status === WagerTransactionStatus.Failed
    ) {
      throw new InvalidTransactionStateError();
    }
  }
  // ==================================================================================================================================================================

  public isTerminal(): boolean {
    return [
      WagerTransactionStatus.Processed,
      WagerTransactionStatus.Rejected,
      WagerTransactionStatus.Failed,
    ].includes(this._status);
  }

  public affectsBalance(): boolean {
    return this.kind !== WagerTransactionKind.Loss;
  }

  public requiresReference(): boolean {
    return [
      WagerTransactionKind.Refund,
      WagerTransactionKind.Rollback,
    ].includes(this.kind);
  }

  public matchesPayload(payloadHash: string): boolean {
    return this.payloadHash === payloadHash;
  }

  public ledgerDirectionForReference(
    reference?: WagerTransaction
  ): LedgerDirection | undefined {

    if (this.kind === WagerTransactionKind.Loss) {
      return undefined;
    }

    if (this.kind !== WagerTransactionKind.Rollback) {
      return this.ledgerDirectionForKind(this.kind);
    }

    if (!reference) {
      throw new Error("Rollback requires a reference transaction");
    }

    const referenceDirection = this.ledgerDirectionForKind(reference.kind);

    if (!referenceDirection) {
      throw new Error("Invalid rollback reference kind");
    }

    return referenceDirection === LedgerDirection.Debit
      ? LedgerDirection.Credit
      : LedgerDirection.Debit;
  }

  private ledgerDirectionForKind(
    kind: WagerTransactionKind
  ): LedgerDirection | undefined {

    switch (kind) {
      case WagerTransactionKind.Opening:
      case WagerTransactionKind.Win:
      case WagerTransactionKind.Refund:
        return LedgerDirection.Credit;

      case WagerTransactionKind.Bet:
        return LedgerDirection.Debit;

      case WagerTransactionKind.Loss:
        return undefined;

      default:
        return undefined;
    }
  }

}

export default WagerTransaction;