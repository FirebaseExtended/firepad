/**
 * Immutable class representing a geo point as latitude-longitude pair.
 * This class is directly exposed in the public API, including its constructor.
 */
export declare class GeoPoint {
    private _lat;
    private _long;
    constructor(latitude: number, longitude: number);
    /**
     * Returns the latitude of this geo point, a number between -90 and 90.
     */
    readonly latitude: number;
    /**
     * Returns the longitude of this geo point, a number between -180 and 180.
     */
    readonly longitude: number;
    isEqual(other: GeoPoint): boolean;
    /**
     * Actually private to JS consumers of our API, so this function is prefixed
     * with an underscore.
     */
    _compareTo(other: GeoPoint): number;
}
