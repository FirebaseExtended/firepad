import { Token } from '../api/credentials';
import { DatabaseInfo } from '../core/database_info';
import { Connection, Stream } from '../remote/connection';
export declare class WebChannelConnection implements Connection {
    private readonly databaseId;
    private readonly baseUrl;
    private readonly pool;
    constructor(info: DatabaseInfo);
    /**
     * Modifies the headers for a request, adding any authorization token if
     * present and any additional headers for the request.
     */
    private modifyHeadersForRequest(headers, token);
    invokeRPC<Req, Resp>(rpcName: string, request: Req, token: Token | null): Promise<Resp>;
    invokeStreamingRPC<Req, Resp>(rpcName: string, request: Req, token: Token | null): Promise<Resp[]>;
    openStream<Req, Resp>(rpcName: string, token: Token | null): Stream<Req, Resp>;
    makeUrl(rpcName: string): string;
}
