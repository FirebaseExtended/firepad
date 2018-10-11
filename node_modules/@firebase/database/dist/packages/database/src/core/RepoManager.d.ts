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
import { FirebaseApp } from '@firebase/app-types';
import { Repo } from './Repo';
import './Repo_transaction';
import { Database } from '../api/Database';
import { RepoInfo } from './RepoInfo';
/**
 * Creates and caches Repo instances.
 */
export declare class RepoManager {
    /**
     * @private {!Object.<string, Object<string, !fb.core.Repo>>}
     */
    private repos_;
    /**
     * If true, new Repos will be created to use ReadonlyRestClient (for testing purposes).
     * @private {boolean}
     */
    private useRestClient_;
    static getInstance(): RepoManager;
    interrupt(): void;
    resume(): void;
    /**
     * This function should only ever be called to CREATE a new database instance.
     *
     * @param {!FirebaseApp} app
     * @return {!Database}
     */
    databaseFromApp(app: FirebaseApp, url?: string): Database;
    /**
     * Remove the repo and make sure it is disconnected.
     *
     * @param {!Repo} repo
     */
    deleteRepo(repo: Repo): void;
    /**
     * Ensures a repo doesn't already exist and then creates one using the
     * provided app.
     *
     * @param {!RepoInfo} repoInfo The metadata about the Repo
     * @param {!FirebaseApp} app
     * @return {!Repo} The Repo object for the specified server / repoName.
     */
    createRepo(repoInfo: RepoInfo, app: FirebaseApp): Repo;
    /**
     * Forces us to use ReadonlyRestClient instead of PersistentConnection for new Repos.
     * @param {boolean} forceRestClient
     */
    forceRestClient(forceRestClient: boolean): void;
}
