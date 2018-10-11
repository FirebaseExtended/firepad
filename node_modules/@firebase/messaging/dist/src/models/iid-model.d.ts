export interface IidDetails {
    token: string;
    pushSet: string;
}
export declare class IidModel {
    getToken(senderId: string, subscription: PushSubscription, publicVapidKey: Uint8Array): Promise<IidDetails>;
    /**
     * Update the underlying token details for fcmToken.
     */
    updateToken(senderId: string, fcmToken: string, fcmPushSet: string, subscription: PushSubscription, publicVapidKey: Uint8Array): Promise<string>;
    /**
     * Given a fcmToken, pushSet and messagingSenderId, delete an FCM token.
     */
    deleteToken(senderId: string, fcmToken: string, fcmPushSet: string): Promise<void>;
}
