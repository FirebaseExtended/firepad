import { Reference } from './Reference';
/**
 * INTERNAL methods for internal-use only (tests, etc.).
 *
 * Customers shouldn't use these or else should be aware that they could break at any time.
 *
 * @const
 */
export declare const forceLongPolling: () => void;
export declare const forceWebSockets: () => void;
export declare const isWebSocketsAvailable: () => boolean;
export declare const setSecurityDebugCallback: (ref: Reference, callback: (a: Object) => void) => void;
export declare const stats: (ref: Reference, showDelta?: boolean) => void;
export declare const statsIncrementCounter: (ref: Reference, metric: string) => void;
export declare const dataUpdateCount: (ref: Reference) => number;
export declare const interceptServerData: (ref: Reference, callback: (a: string, b: any) => void) => void;
