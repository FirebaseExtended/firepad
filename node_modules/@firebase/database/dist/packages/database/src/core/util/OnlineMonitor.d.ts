import { EventEmitter } from './EventEmitter';
/**
 * Monitors online state (as reported by window.online/offline events).
 *
 * The expectation is that this could have many false positives (thinks we are online
 * when we're not), but no false negatives.  So we can safely use it to determine when
 * we definitely cannot reach the internet.
 *
 * @extends {EventEmitter}
 */
export declare class OnlineMonitor extends EventEmitter {
    private online_;
    static getInstance(): OnlineMonitor;
    constructor();
    /**
     * @param {!string} eventType
     * @return {Array.<boolean>}
     */
    getInitialEvent(eventType: string): boolean[];
    /**
     * @return {boolean}
     */
    currentlyOnline(): boolean;
}
