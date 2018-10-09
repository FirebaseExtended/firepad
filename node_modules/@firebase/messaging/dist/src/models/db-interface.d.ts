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
export declare abstract class DbInterface {
    private dbPromise;
    protected readonly abstract dbName: string;
    protected readonly abstract dbVersion: number;
    protected readonly abstract objectStoreName: string;
    /**
     * Database initialization.
     *
     * This function should create and update object stores.
     */
    protected abstract onDbUpgrade(request: IDBOpenDBRequest, event: IDBVersionChangeEvent): void;
    /** Gets record(s) from the objectStore that match the given key. */
    get<T>(key: IDBValidKey): Promise<T | undefined>;
    /** Gets record(s) from the objectStore that match the given index. */
    getIndex<T>(index: string, key: IDBValidKey): Promise<T | undefined>;
    /** Assigns or overwrites the record for the given value. */
    put(value: any): Promise<void>;
    /** Deletes record(s) from the objectStore that match the given key. */
    delete(key: IDBValidKey | IDBKeyRange): Promise<void>;
    /**
     * Close the currently open database.
     */
    closeDatabase(): Promise<void>;
    /**
     * Creates an IndexedDB Transaction and passes its objectStore to the
     * runRequest function, which runs the database request.
     *
     * @return Promise that resolves with the result of the runRequest function
     */
    private createTransaction<T>(runRequest, mode?);
    /** Gets the cached db connection or opens a new one. */
    private getDb();
}
