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
import { FirebaseApp } from '@firebase/app-types';
import { FirebaseFunctions, HttpsCallable } from '@firebase/functions-types';
/**
 * The main class for the Firebase Functions SDK.
 */
export declare class Service implements FirebaseFunctions {
    private app_;
    private region_;
    private readonly contextProvider;
    private readonly serializer;
    private emulatorOrigin;
    /**
     * Creates a new Functions service for the given app and (optional) region.
     * @param app_ The FirebaseApp to use.
     * @param region_ The region to call functions in.
     */
    constructor(app_: FirebaseApp, region_?: string);
    readonly app: FirebaseApp;
    /**
     * Returns the URL for a callable with the given name.
     * @param name The name of the callable.
     */
    _url(name: string): string;
    /**
     * Changes this instance to point to a Cloud Functions emulator running
     * locally. See https://firebase.google.com/docs/functions/local-emulator
     *
     * @param origin The origin of the local emulator, such as
     * "http://localhost:5005".
     */
    useFunctionsEmulator(origin: string): void;
    /**
     * Returns a reference to the callable https trigger with the given name.
     * @param name The name of the trigger.
     */
    httpsCallable(name: string): HttpsCallable;
    /**
     * Does an HTTP POST and returns the completed response.
     * @param url The url to post to.
     * @param body The JSON body of the post.
     * @param headers The HTTP headers to include in the request.
     * @return A Promise that will succeed when the request finishes.
     */
    private postJSON(url, body, headers);
    /**
     * Calls a callable function asynchronously and returns the result.
     * @param name The name of the callable trigger.
     * @param data The data to pass as params to the function.s
     */
    private call(name, data);
}
