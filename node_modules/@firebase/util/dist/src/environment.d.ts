/**
 * Returns navigator.userAgent string or '' if it's not defined.
 * @return {string} user agent string
 */
export declare const getUA: () => string;
/**
 * Detect Cordova / PhoneGap / Ionic frameworks on a mobile device.
 *
 * Deliberately does not rely on checking `file://` URLs (as this fails PhoneGap in the Ripple emulator) nor
 * Cordova `onDeviceReady`, which would normally wait for a callback.
 *
 * @return {boolean} isMobileCordova
 */
export declare const isMobileCordova: () => boolean;
/**
 * Detect React Native.
 *
 * @return {boolean} True if ReactNative environment is detected.
 */
export declare const isReactNative: () => boolean;
/**
 * Detect Node.js.
 *
 * @return {boolean} True if Node.js environment is detected.
 */
export declare const isNodeSdk: () => boolean;
