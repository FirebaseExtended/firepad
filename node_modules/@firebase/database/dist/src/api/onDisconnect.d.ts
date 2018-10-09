import { Repo } from '../core/Repo';
import { Path } from '../core/util/Path';
/**
 * @constructor
 */
export declare class OnDisconnect {
    private repo_;
    private path_;
    /**
     * @param {!Repo} repo_
     * @param {!Path} path_
     */
    constructor(repo_: Repo, path_: Path);
    /**
     * @param {function(?Error)=} onComplete
     * @return {!firebase.Promise}
     */
    cancel(onComplete?: (a: Error | null) => void): Promise<void>;
    /**
     * @param {function(?Error)=} onComplete
     * @return {!firebase.Promise}
     */
    remove(onComplete?: (a: Error | null) => void): Promise<void>;
    /**
     * @param {*} value
     * @param {function(?Error)=} onComplete
     * @return {!firebase.Promise}
     */
    set(value: any, onComplete?: (a: Error | null) => void): Promise<void>;
    /**
     * @param {*} value
     * @param {number|string|null} priority
     * @param {function(?Error)=} onComplete
     * @return {!firebase.Promise}
     */
    setWithPriority(value: any, priority: number | string | null, onComplete?: (a: Error | null) => void): Promise<void>;
    /**
     * @param {!Object} objectToMerge
     * @param {function(?Error)=} onComplete
     * @return {!firebase.Promise}
     */
    update(objectToMerge: object, onComplete?: (a: Error | null) => void): Promise<void>;
}
