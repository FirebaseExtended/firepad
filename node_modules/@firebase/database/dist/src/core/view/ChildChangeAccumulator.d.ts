import { Change } from './Change';
/**
 * @constructor
 */
export declare class ChildChangeAccumulator {
    private changeMap_;
    /**
     * @param {!Change} change
     */
    trackChildChange(change: Change): void;
    /**
     * @return {!Array.<!Change>}
     */
    getChanges(): Change[];
}
