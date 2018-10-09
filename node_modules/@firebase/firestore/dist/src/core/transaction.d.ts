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
import { ParsedSetData, ParsedUpdateData } from '../api/user_data_converter';
import { MaybeDocument } from '../model/document';
import { DocumentKey } from '../model/document_key';
import { Datastore } from '../remote/datastore';
/**
 * Internal transaction object responsible for accumulating the mutations to
 * perform and the base versions for any documents read.
 */
export declare class Transaction {
    private datastore;
    private readVersions;
    private mutations;
    private committed;
    constructor(datastore: Datastore);
    private recordVersion(doc);
    lookup(keys: DocumentKey[]): Promise<MaybeDocument[]>;
    private write(mutations);
    /**
     * Returns the version of this document when it was read in this transaction,
     * as a precondition, or no precondition if it was not read.
     */
    private precondition(key);
    /**
     * Returns the precondition for a document if the operation is an update.
     */
    private preconditionForUpdate(key);
    set(key: DocumentKey, data: ParsedSetData): void;
    update(key: DocumentKey, data: ParsedUpdateData): void;
    delete(key: DocumentKey): void;
    commit(): Promise<void>;
}
