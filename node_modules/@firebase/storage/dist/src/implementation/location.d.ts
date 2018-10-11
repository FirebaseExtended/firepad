/**
 * @struct
 */
export declare class Location {
    readonly bucket: string;
    private path_;
    constructor(bucket: string, path: string);
    readonly path: string;
    fullServerUrl(): string;
    bucketOnlyServerUrl(): string;
    static makeFromBucketSpec(bucketString: string): Location;
    static makeFromUrl(url: string): Location;
}
