/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Timestamp } from '../api/timestamp';
import { SnapshotVersion } from '../core/snapshot_version';
import { BatchId, ProtoByteString } from '../core/types';
import { DocumentKeySet, DocumentVersionMap } from './collections';
import { MaybeDocument } from './document';
import { DocumentKey } from './document_key';
import { Mutation, MutationResult } from './mutation';
export declare const BATCHID_UNKNOWN = -1;
/**
 * A batch of mutations that will be sent as one unit to the backend.
 */
export declare class MutationBatch {
    batchId: BatchId;
    localWriteTime: Timestamp;
    mutations: Mutation[];
    constructor(batchId: BatchId, localWriteTime: Timestamp, mutations: Mutation[]);
    /**
     * Applies all the mutations in this MutationBatch to the specified document
     * to create a new remote document
     *
     * @param docKey The key of the document to apply mutations to.
     * @param maybeDoc The document to apply mutations to.
     * @param batchResult The result of applying the MutationBatch to the
     * backend.
     */
    applyToRemoteDocument(docKey: DocumentKey, maybeDoc: MaybeDocument | null, batchResult: MutationBatchResult): MaybeDocument | null;
    /**
     * Computes the local view of a document given all the mutations in this
     * batch.
     *
     * @param docKey The key of the document to apply mutations to.
     * @param maybeDoc The document to apply mutations to.
     */
    applyToLocalView(docKey: DocumentKey, maybeDoc: MaybeDocument | null): MaybeDocument | null;
    keys(): DocumentKeySet;
    isEqual(other: MutationBatch): boolean;
    /**
     * Returns true if this mutation batch has already been removed from the
     * mutation queue.
     *
     * Note that not all implementations of the MutationQueue necessarily use
     * tombstones as part of their implementation and generally speaking no code
     * outside the mutation queues should really care about this.
     */
    isTombstone(): boolean;
    /** Converts this batch into a tombstone */
    toTombstone(): MutationBatch;
}
/** The result of applying a mutation batch to the backend. */
export declare class MutationBatchResult {
    readonly batch: MutationBatch;
    readonly commitVersion: SnapshotVersion;
    readonly mutationResults: MutationResult[];
    readonly streamToken: ProtoByteString;
    /**
     * A pre-computed mapping from each mutated document to the resulting
     * version.
     */
    readonly docVersions: DocumentVersionMap;
    private constructor();
    /**
     * Creates a new MutationBatchResult for the given batch and results. There
     * must be one result for each mutation in the batch. This static factory
     * caches a document=>version mapping (docVersions).
     */
    static from(batch: MutationBatch, commitVersion: SnapshotVersion, results: MutationResult[], streamToken: ProtoByteString): MutationBatchResult;
}
