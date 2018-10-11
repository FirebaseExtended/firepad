import { StatsCollection } from './StatsCollection';
/**
 * Returns the delta from the previous call to get stats.
 *
 * @param collection_ The collection to "listen" to.
 * @constructor
 */
export declare class StatsListener {
    private collection_;
    private last_;
    constructor(collection_: StatsCollection);
    get(): {
        [k: string]: number;
    };
}
