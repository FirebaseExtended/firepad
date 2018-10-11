import { MaybeDocument } from '../model/document';
import { DocumentKey } from '../model/document_key';
import { PersistenceTransaction } from './persistence';
import { PersistencePromise } from './persistence_promise';
import { RemoteDocumentCache } from './remote_document_cache';
/**
 * An in-memory buffer of entries to be written to a RemoteDocumentCache.
 * It can be used to batch up a set of changes to be written to the cache, but
 * additionally supports reading entries back with the `getEntry()` method,
 * falling back to the underlying RemoteDocumentCache if no entry is
 * buffered.
 *
 * NOTE: This class was introduced in iOS to work around a limitation in
 * LevelDB. Given IndexedDb has full transaction support with
 * read-your-own-writes capability, this class is not technically needed, but
 * has been preserved as a convenience and to aid portability.
 */
export declare class RemoteDocumentChangeBuffer {
    private remoteDocumentCache;
    private changes;
    constructor(remoteDocumentCache: RemoteDocumentCache);
    /** Buffers a `RemoteDocumentCache.addEntry()` call. */
    addEntry(maybeDocument: MaybeDocument): void;
    /**
     * Looks up an entry in the cache. The buffered changes will first be checked,
     * and if no buffered change applies, this will forward to
     * `RemoteDocumentCache.getEntry()`.
     *
     * @param transaction The transaction in which to perform any persistence
     *     operations.
     * @param documentKey The key of the entry to look up.
     * @return The cached Document or NoDocument entry, or null if we have nothing
     * cached.
     */
    getEntry(transaction: PersistenceTransaction, documentKey: DocumentKey): PersistencePromise<MaybeDocument | null>;
    /**
     * Applies buffered changes to the underlying RemoteDocumentCache, using
     * the provided transaction.
     */
    apply(transaction: PersistenceTransaction): PersistencePromise<void>;
    /** Helper to assert this.changes is not null and return it. */
    private assertChanges();
}
