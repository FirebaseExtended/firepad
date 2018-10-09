import { AnyJs } from './misc';
export declare enum LogLevel {
    DEBUG = 0,
    ERROR = 1,
    SILENT = 2,
}
export declare function getLogLevel(): LogLevel;
export declare function setLogLevel(newLevel: LogLevel): void;
export declare function debug(tag: string, msg: string, ...obj: AnyJs[]): void;
export declare function error(msg: string, ...obj: AnyJs[]): void;
