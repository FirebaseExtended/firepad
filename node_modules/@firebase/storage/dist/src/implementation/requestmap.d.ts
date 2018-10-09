import { Request } from './request';
/**
 * @struct
 */
export declare class RequestMap {
    private map_;
    private id_;
    constructor();
    /**
     * Registers the given request with this map.
     * The request is unregistered when it completes.
     * @param r The request to register.
     */
    addRequest(r: Request<any>): void;
    /**
     * Cancels all registered requests.
     */
    clear(): void;
}
