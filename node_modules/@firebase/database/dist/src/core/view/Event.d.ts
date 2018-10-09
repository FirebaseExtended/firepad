import { Path } from '../util/Path';
import { EventRegistration } from './EventRegistration';
import { DataSnapshot } from '../../api/DataSnapshot';
/**
 * Encapsulates the data needed to raise an event
 * @interface
 */
export interface Event {
    /**
     * @return {!Path}
     */
    getPath(): Path;
    /**
     * @return {!string}
     */
    getEventType(): string;
    /**
     * @return {!function()}
     */
    getEventRunner(): () => void;
    /**
     * @return {!string}
     */
    toString(): string;
}
/**
 * Encapsulates the data needed to raise an event
 * @implements {Event}
 */
export declare class DataEvent implements Event {
    eventType: 'value' | ' child_added' | ' child_changed' | ' child_moved' | ' child_removed';
    eventRegistration: EventRegistration;
    snapshot: DataSnapshot;
    prevName: string | null;
    /**
     * @param {!string} eventType One of: value, child_added, child_changed, child_moved, child_removed
     * @param {!EventRegistration} eventRegistration The function to call to with the event data. User provided
     * @param {!DataSnapshot} snapshot The data backing the event
     * @param {?string=} prevName Optional, the name of the previous child for child_* events.
     */
    constructor(eventType: 'value' | ' child_added' | ' child_changed' | ' child_moved' | ' child_removed', eventRegistration: EventRegistration, snapshot: DataSnapshot, prevName?: string | null);
    /**
     * @inheritDoc
     */
    getPath(): Path;
    /**
     * @inheritDoc
     */
    getEventType(): string;
    /**
     * @inheritDoc
     */
    getEventRunner(): () => void;
    /**
     * @inheritDoc
     */
    toString(): string;
}
export declare class CancelEvent implements Event {
    eventRegistration: EventRegistration;
    error: Error;
    path: Path;
    /**
     * @param {EventRegistration} eventRegistration
     * @param {Error} error
     * @param {!Path} path
     */
    constructor(eventRegistration: EventRegistration, error: Error, path: Path);
    /**
     * @inheritDoc
     */
    getPath(): Path;
    /**
     * @inheritDoc
     */
    getEventType(): string;
    /**
     * @inheritDoc
     */
    getEventRunner(): () => void;
    /**
     * @inheritDoc
     */
    toString(): string;
}
