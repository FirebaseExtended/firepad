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
import { Observer } from '../core/event_manager';
export declare class AsyncObserver<T> implements Observer<T> {
    private observer;
    /**
     * When set to true, will not raise future events. Necessary to deal with
     * async detachment of listener.
     */
    private muted;
    constructor(observer: Observer<T>);
    next(value: T): void;
    error(error: Error): void;
    mute(): void;
    private scheduleEvent<E>(eventHandler, event);
}
