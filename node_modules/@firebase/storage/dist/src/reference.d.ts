import { AuthWrapper } from './implementation/authwrapper';
import { Location } from './implementation/location';
import * as metadata from './implementation/metadata';
import { StringFormat } from './implementation/string';
import { Metadata } from './metadata';
import { Service } from './service';
import { UploadTask } from './task';
/**
 * Provides methods to interact with a bucket in the Firebase Storage service.
 * @param location An fbs.location, or the URL at
 *     which to base this object, in one of the following forms:
 *         gs://<bucket>/<object-path>
 *         http[s]://firebasestorage.googleapis.com/
 *                     <api-version>/b/<bucket>/o/<object-path>
 *     Any query or fragment strings will be ignored in the http[s]
 *     format. If no value is passed, the storage object will use a URL based on
 *     the project ID of the base firebase.App instance.
 */
export declare class Reference {
    protected authWrapper: AuthWrapper;
    protected location: Location;
    constructor(authWrapper: AuthWrapper, location: string | Location);
    /**
     * @return The URL for the bucket and path this object references,
     *     in the form gs://<bucket>/<object-path>
     * @override
     */
    toString(): string;
    protected newRef(authWrapper: AuthWrapper, location: Location): Reference;
    protected mappings(): metadata.Mappings;
    /**
     * @return A reference to the object obtained by
     *     appending childPath, removing any duplicate, beginning, or trailing
     *     slashes.
     */
    child(childPath: string): Reference;
    /**
     * @return A reference to the parent of the
     *     current object, or null if the current object is the root.
     */
    readonly parent: Reference | null;
    /**
     * @return An reference to the root of this
     *     object's bucket.
     */
    readonly root: Reference;
    readonly bucket: string;
    readonly fullPath: string;
    readonly name: string;
    readonly storage: Service;
    /**
     * Uploads a blob to this object's location.
     * @param data The blob to upload.
     * @return An UploadTask that lets you control and
     *     observe the upload.
     */
    put(data: Blob | Uint8Array | ArrayBuffer, metadata?: Metadata | null): UploadTask;
    /**
     * Uploads a string to this object's location.
     * @param string The string to upload.
     * @param opt_format The format of the string to upload.
     * @return An UploadTask that lets you control and
     *     observe the upload.
     */
    putString(string: string, format?: StringFormat, opt_metadata?: Metadata): UploadTask;
    /**
     * Deletes the object at this location.
     * @return A promise that resolves if the deletion succeeds.
     */
    delete(): Promise<void>;
    /**
     *     A promise that resolves with the metadata for this object. If this
     *     object doesn't exist or metadata cannot be retreived, the promise is
     *     rejected.
     */
    getMetadata(): Promise<Metadata>;
    /**
     * Updates the metadata for this object.
     * @param metadata The new metadata for the object.
     *     Only values that have been explicitly set will be changed. Explicitly
     *     setting a value to null will remove the metadata.
     * @return A promise that resolves
     *     with the new metadata for this object.
     *     @see firebaseStorage.Reference.prototype.getMetadata
     */
    updateMetadata(metadata: Metadata): Promise<Metadata>;
    /**
     * @return A promise that resolves with the download
     *     URL for this object.
     */
    getDownloadURL(): Promise<string>;
    private throwIfRoot_(name);
}
