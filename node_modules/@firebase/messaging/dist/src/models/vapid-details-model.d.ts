import { DbInterface } from './db-interface';
export declare class VapidDetailsModel extends DbInterface {
    protected readonly dbName: string;
    protected readonly dbVersion: number;
    protected readonly objectStoreName: string;
    protected onDbUpgrade(request: IDBOpenDBRequest): void;
    /**
     * Given a service worker scope, this method will look up the vapid key
     * in indexedDB.
     */
    getVapidFromSWScope(swScope: string): Promise<Uint8Array | undefined>;
    /**
     * Save a vapid key against a swScope for later date.
     */
    saveVapidDetails(swScope: string, vapidKey: Uint8Array): Promise<void>;
    /**
     * This method deletes details of the current FCM VAPID key for a SW scope.
     * Resolves once the scope/vapid details have been deleted and returns the
     * deleted vapid key.
     */
    deleteVapidDetails(swScope: string): Promise<Uint8Array>;
}
