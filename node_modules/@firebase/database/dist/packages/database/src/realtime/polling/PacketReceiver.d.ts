/**
 * This class ensures the packets from the server arrive in order
 * This class takes data from the server and ensures it gets passed into the callbacks in order.
 * @constructor
 */
export declare class PacketReceiver {
    private onMessage_;
    pendingResponses: any[];
    currentResponseNum: number;
    closeAfterResponse: number;
    onClose: (() => void) | null;
    /**
     * @param onMessage_
     */
    constructor(onMessage_: (a: Object) => void);
    closeAfter(responseNum: number, callback: () => void): void;
    /**
     * Each message from the server comes with a response number, and an array of data. The responseNumber
     * allows us to ensure that we process them in the right order, since we can't be guaranteed that all
     * browsers will respond in the same order as the requests we sent
     * @param {number} requestNum
     * @param {Array} data
     */
    handleResponse(requestNum: number, data: any[]): void;
}
