import { TokenDetails } from '../interfaces/token-details';
import { DbInterface } from './db-interface';
export declare class TokenDetailsModel extends DbInterface {
    protected readonly dbName: string;
    protected readonly dbVersion: number;
    protected readonly objectStoreName: string;
    protected onDbUpgrade(request: IDBOpenDBRequest, event: IDBVersionChangeEvent): void;
    /**
     * Given a token, this method will look up the details in indexedDB.
     */
    getTokenDetailsFromToken(fcmToken: string): Promise<TokenDetails | undefined>;
    /**
     * Given a service worker scope, this method will look up the details in
     * indexedDB.
     * @return The details associated with that token.
     */
    getTokenDetailsFromSWScope(swScope: string): Promise<TokenDetails | undefined>;
    /**
     * Save the details for the fcm token for re-use at a later date.
     * @param input A plain js object containing args to save.
     */
    saveTokenDetails(tokenDetails: TokenDetails): Promise<void>;
    /**
     * This method deletes details of the current FCM token.
     * It's returning a promise in case we need to move to an async
     * method for deleting at a later date.
     *
     * @return Resolves once the FCM token details have been deleted and returns
     * the deleted details.
     */
    deleteToken(token: string): Promise<TokenDetails>;
}
