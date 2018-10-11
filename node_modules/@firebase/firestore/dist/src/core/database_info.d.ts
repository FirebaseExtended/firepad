export declare class DatabaseInfo {
    readonly databaseId: DatabaseId;
    readonly persistenceKey: string;
    readonly host: string;
    readonly ssl: boolean;
    /**
     * Constructs a DatabaseInfo using the provided host, databaseId and
     * persistenceKey.
     *
     * @param databaseId The database to use.
     * @param persistenceKey A unique identifier for this Firestore's local
     * storage (used in conjunction with the databaseId).
     * @param host The Firestore backend host to connect to.
     * @param ssl Whether to use SSL when connecting.
     */
    constructor(databaseId: DatabaseId, persistenceKey: string, host: string, ssl: boolean);
}
/** Represents the database ID a Firestore client is associated with. */
export declare class DatabaseId {
    readonly projectId: string;
    readonly database: string;
    constructor(projectId: string, database?: string);
    readonly isDefaultDatabase: boolean;
    isEqual(other: {}): boolean;
    compareTo(other: DatabaseId): number;
}
