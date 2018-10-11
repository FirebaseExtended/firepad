/**
 * Base class to be used if you want to emit events. Call the constructor with
 * the set of allowed event names.
 */
export declare abstract class EventEmitter {
    private allowedEvents_;
    private listeners_;
    /**
     * @param {!Array.<string>} allowedEvents_
     */
    constructor(allowedEvents_: Array<string>);
    /**
     * To be overridden by derived classes in order to fire an initial event when
     * somebody subscribes for data.
     *
     * @param {!string} eventType
     * @return {Array.<*>} Array of parameters to trigger initial event with.
     */
    abstract getInitialEvent(eventType: string): any[];
    /**
     * To be called by derived classes to trigger events.
     * @param {!string} eventType
     * @param {...*} var_args
     */
    protected trigger(eventType: string, ...var_args: any[]): void;
    on(eventType: string, callback: (a: any) => void, context: any): void;
    off(eventType: string, callback: (a: any) => void, context: any): void;
    private validateEventType_(eventType);
}
