/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @fileoverview Defines methods for interacting with the network.
 */
import { Metadata } from '../metadata';
import { AuthWrapper } from './authwrapper';
import { FbsBlob } from './blob';
import { FirebaseStorageError } from './error';
import { Location } from './location';
import * as MetadataUtils from './metadata';
import { RequestInfo } from './requestinfo';
import { XhrIo } from './xhrio';
/**
 * Throws the UNKNOWN FirebaseStorageError if cndn is false.
 */
export declare function handlerCheck(cndn: boolean): void;
export declare function metadataHandler(authWrapper: AuthWrapper, mappings: MetadataUtils.Mappings): (p1: XhrIo, p2: string) => Metadata;
export declare function downloadUrlHandler(authWrapper: AuthWrapper, mappings: MetadataUtils.Mappings): (p1: XhrIo, p2: string) => string;
export declare function sharedErrorHandler(location: Location): (p1: XhrIo, p2: FirebaseStorageError) => FirebaseStorageError;
export declare function objectErrorHandler(location: Location): (p1: XhrIo, p2: FirebaseStorageError) => FirebaseStorageError;
export declare function getMetadata(authWrapper: AuthWrapper, location: Location, mappings: MetadataUtils.Mappings): RequestInfo<Metadata>;
export declare function getDownloadUrl(authWrapper: AuthWrapper, location: Location, mappings: MetadataUtils.Mappings): RequestInfo<string | null>;
export declare function updateMetadata(authWrapper: AuthWrapper, location: Location, metadata: Metadata, mappings: MetadataUtils.Mappings): RequestInfo<Metadata>;
export declare function deleteObject(authWrapper: AuthWrapper, location: Location): RequestInfo<void>;
export declare function determineContentType_(metadata: Metadata | null, blob: FbsBlob | null): string;
export declare function metadataForUpload_(location: Location, blob: FbsBlob, opt_metadata?: Metadata | null): Metadata;
export declare function multipartUpload(authWrapper: AuthWrapper, location: Location, mappings: MetadataUtils.Mappings, blob: FbsBlob, opt_metadata?: Metadata | null): RequestInfo<Metadata>;
/**
 * @param current The number of bytes that have been uploaded so far.
 * @param total The total number of bytes in the upload.
 * @param opt_finalized True if the server has finished the upload.
 * @param opt_metadata The upload metadata, should
 *     only be passed if opt_finalized is true.
 * @struct
 */
export declare class ResumableUploadStatus {
    current: number;
    total: number;
    finalized: boolean;
    metadata: Metadata | null;
    constructor(current: number, total: number, finalized?: boolean, metadata?: Metadata | null);
}
export declare function checkResumeHeader_(xhr: XhrIo, opt_allowed?: string[]): string;
export declare function createResumableUpload(authWrapper: AuthWrapper, location: Location, mappings: MetadataUtils.Mappings, blob: FbsBlob, opt_metadata?: Metadata | null): RequestInfo<string>;
/**
 * @param url From a call to fbs.requests.createResumableUpload.
 */
export declare function getResumableUploadStatus(authWrapper: AuthWrapper, location: Location, url: string, blob: FbsBlob): RequestInfo<ResumableUploadStatus>;
/**
 * Any uploads via the resumable upload API must transfer a number of bytes
 * that is a multiple of this number.
 */
export declare const resumableUploadChunkSize: number;
/**
 * @param url From a call to fbs.requests.createResumableUpload.
 * @param chunkSize Number of bytes to upload.
 * @param opt_status The previous status.
 *     If not passed or null, we start from the beginning.
 * @throws fbs.Error If the upload is already complete, the passed in status
 *     has a final size inconsistent with the blob, or the blob cannot be sliced
 *     for upload.
 */
export declare function continueResumableUpload(location: Location, authWrapper: AuthWrapper, url: string, blob: FbsBlob, chunkSize: number, mappings: MetadataUtils.Mappings, opt_status?: ResumableUploadStatus | null, opt_progressCallback?: ((p1: number, p2: number) => void) | null): RequestInfo<ResumableUploadStatus>;
