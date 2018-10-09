/**
 * Tracks a collection of stats.
 *
 * @constructor
 */
export declare class StatsCollection {
    private counters_;
    incrementCounter(name: string, amount?: number): void;
    get(): {
        [k: string]: number;
    };
}
