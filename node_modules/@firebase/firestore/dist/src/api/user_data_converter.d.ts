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
import * as firestore from '@firebase/firestore-types';
import { DatabaseId } from '../core/database_info';
import { DocumentKey } from '../model/document_key';
import { FieldValue, ObjectValue } from '../model/field_value';
import { FieldMask, FieldTransform, Mutation, Precondition } from '../model/mutation';
import { FieldPath } from '../model/path';
import { AnyJs } from '../util/misc';
import { FieldPath as ExternalFieldPath } from './field_path';
/** The result of parsing document data (e.g. for a setData call). */
export declare class ParsedSetData {
    readonly data: ObjectValue;
    readonly fieldMask: FieldMask | null;
    readonly fieldTransforms: FieldTransform[];
    constructor(data: ObjectValue, fieldMask: FieldMask | null, fieldTransforms: FieldTransform[]);
    toMutations(key: DocumentKey, precondition: Precondition): Mutation[];
}
/** The result of parsing "update" data (i.e. for an updateData call). */
export declare class ParsedUpdateData {
    readonly data: ObjectValue;
    readonly fieldMask: FieldMask;
    readonly fieldTransforms: FieldTransform[];
    constructor(data: ObjectValue, fieldMask: FieldMask, fieldTransforms: FieldTransform[]);
    toMutations(key: DocumentKey, precondition: Precondition): Mutation[];
}
/**
 * An interface that allows arbitrary pre-converting of user data. This
 * abstraction allows for, e.g.:
 *  * The public API to convert DocumentReference objects to DocRef objects,
 *    avoiding a circular dependency between user_data_converter.ts and
 *    database.ts
 *  * Tests to convert test-only sentinels (e.g. '<DELETE>') into types
 *    compatible with UserDataConverter.
 *
 * Returns the converted value (can return back the input to act as a no-op).
 *
 * It can also throw an Error which will be wrapped into a friendly message.
 */
export declare type DataPreConverter = (input: AnyJs) => AnyJs;
/**
 * A placeholder object for DocumentReferences in this file, in order to
 * avoid a circular dependency. See the comments for `DataPreConverter` for
 * the full context.
 */
export declare class DocumentKeyReference {
    databaseId: DatabaseId;
    key: DocumentKey;
    constructor(databaseId: DatabaseId, key: DocumentKey);
}
/**
 * Helper for parsing raw user input (provided via the API) into internal model
 * classes.
 */
export declare class UserDataConverter {
    private preConverter;
    constructor(preConverter: DataPreConverter);
    /** Parse document data from a non-merge set() call. */
    parseSetData(methodName: string, input: AnyJs): ParsedSetData;
    /** Parse document data from a set() call with '{merge:true}'. */
    parseMergeData(methodName: string, input: AnyJs, fieldPaths?: Array<string | firestore.FieldPath>): ParsedSetData;
    /** Parse update data from an update() call. */
    parseUpdateData(methodName: string, input: AnyJs): ParsedUpdateData;
    /** Parse update data from a list of field/value arguments. */
    parseUpdateVarargs(methodName: string, field: string | ExternalFieldPath, value: AnyJs, moreFieldsAndValues: AnyJs[]): ParsedUpdateData;
    /**
     * Parse a "query value" (e.g. value in a where filter or a value in a cursor
     * bound).
     */
    parseQueryValue(methodName: string, input: AnyJs): FieldValue;
    /** Sends data through this.preConverter, handling any thrown errors. */
    private runPreConverter(input, context);
    /**
     * Internal helper for parsing user data.
     *
     * @param input Data to be parsed.
     * @param context A context object representing the current path being parsed,
     * the source of the data being parsed, etc.
     * @return The parsed value, or null if the value was a FieldValue sentinel
     * that should not be included in the resulting parsed data.
     */
    private parseData(input, context);
    private parseObject(obj, context);
    private parseArray(array, context);
    /**
     * "Parses" the provided FieldValueImpl, adding any necessary transforms to
     * context.fieldTransforms.
     */
    private parseSentinelFieldValue(value, context);
    /**
     * Helper to parse a scalar value (i.e. not an Object, Array, or FieldValue)
     *
     * @return The parsed value
     */
    private parseScalarValue(value, context);
    private parseArrayTransformElements(methodName, elements);
}
/**
 * Helper that calls fromDotSeparatedString() but wraps any error thrown.
 */
export declare function fieldPathFromArgument(methodName: string, path: string | ExternalFieldPath): FieldPath;
