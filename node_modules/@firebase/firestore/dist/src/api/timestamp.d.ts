export declare class Timestamp {
    readonly seconds: number;
    readonly nanoseconds: number;
    static now(): Timestamp;
    static fromDate(date: Date): Timestamp;
    static fromMillis(milliseconds: number): Timestamp;
    constructor(seconds: number, nanoseconds: number);
    toDate(): Date;
    toMillis(): number;
    _compareTo(other: Timestamp): number;
    isEqual(other: Timestamp): boolean;
    toString(): string;
}
