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
 * @fileoverview Documentation for the metadata format
 */
import { Metadata } from '../metadata';
import { AuthWrapper } from './authwrapper';
export declare function noXform_(metadata: Metadata, value: any): any;
/**
 * @struct
 */
export declare class Mapping {
    server: string;
    local: string;
    writable: boolean;
    xform: (p1: Metadata, p2: any) => any;
    constructor(server: string, opt_local?: string | null, opt_writable?: boolean, opt_xform?: (p1: Metadata, p2: any) => any | null);
}
declare type Mappings = Mapping[];
export { Mappings };
export declare function xformPath(fullPath: any): string;
export declare function getMappings(): Mappings;
export declare function addRef(metadata: Metadata, authWrapper: AuthWrapper): void;
export declare function fromResource(authWrapper: AuthWrapper, resource: {
    [name: string]: any;
}, mappings: Mappings): Metadata;
export declare function fromResourceString(authWrapper: AuthWrapper, resourceString: string, mappings: Mappings): Metadata | null;
export declare function downloadUrlFromResourceString(metadata: Metadata, resourceString: string): string | null;
export declare function toResourceString(metadata: Metadata, mappings: Mappings): string;
export declare function metadataValidator(p: any): void;
