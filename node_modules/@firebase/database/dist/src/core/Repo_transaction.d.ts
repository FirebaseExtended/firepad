import { DataSnapshot } from '../api/DataSnapshot';
import { Path } from './util/Path';
/**
 * @enum {number}
 */
export declare enum TransactionStatus {
    RUN = 0,
    SENT = 1,
    COMPLETED = 2,
    SENT_NEEDS_ABORT = 3,
    NEEDS_ABORT = 4,
}
declare module './Repo' {
    interface Repo {
        startTransaction(path: Path, transactionUpdate: (a: any) => void, onComplete: ((a: Error, b: boolean, c: DataSnapshot) => void) | null, applyLocally: boolean): void;
    }
}
