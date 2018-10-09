import { StatsCollection } from './StatsCollection';
import { ServerActions } from '../ServerActions';
/**
 * @constructor
 */
export declare class StatsReporter {
    private server_;
    private statsListener_;
    private statsToReport_;
    /**
     * @param collection
     * @param server_
     */
    constructor(collection: StatsCollection, server_: ServerActions);
    includeStat(stat: string): void;
    private reportStats_();
}
