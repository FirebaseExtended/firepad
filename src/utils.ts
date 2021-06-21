/** Function with no parameter and no return value.  */
export function noop(): void {}
export type VoidFunctionType = typeof noop;

/**
 * Disposable Interface.
 * Applicable to the Interfaces/Objects that requires cleanup after usage.
 */
export interface IDisposable {
  /** Cleanup Function */
  dispose(): void;
}

/**
 * End Of Line Sequences for Editor Content.
 */
export enum EndOfLineSequence {
  LF = "\n",
  CRLF = "\r\n",
}

/**
 * Custom Error Definitions
 */

/**
 * Validation Error: Assertion for data validation failed.
 */
class ValidationError extends Error {
  readonly name: string = "Validation Failed";
}

/**
 * No-op Error: Unexpected method call without any executable code.
 */
class NoopError extends Error {
  readonly name: string = "No-op Encountered";
}

/**
 * Invalid Operation Error: Executing an Invalid Operation.
 */
class InvalidOperationError extends Error {
  readonly name: string = "Invalid Operation Encountered";
}

/**
 * Invalid Operation Order Error: Executing a set of Operations in incorrect order.
 */
class InvalidOperationOrderError extends Error {
  readonly name: string = "Invalid Order of Operations Encountered";
}

/**
 * Invalid Event Error: Triggering or Listening to an Invalid Event.
 */
class InvalidEventError extends Error {
  readonly name: string = "Invalid Event Encountered";
}

/**
 * Database Transaction Error: Database Transaction Failure.
 */
class DatabaseTransactionError extends Error {
  readonly name: string = "Transaction Failed";
}

/**
 * Common Utility Methods
 */

/**
 * Validates if the incoming parameter is an Integer.
 * @param n - Parameter for validation.
 * @param err - Custom Error Message.
 */
export function validateInteger(n: number, err?: string): void {
  if (!Number.isInteger(n)) {
    throw new ValidationError(err || "Expected an integer value");
  }
}

/**
 * Validates if the incoming parameter is a Non-negative Integer.
 * @param n - Parameter for validation.
 * @param err - Custom Error Message.
 */
export function validateNonNegativeInteger(n: number, err?: string): void {
  validateInteger(n, err);

  if (n < 0) {
    throw new ValidationError(err || "Expected a non-negative integer value");
  }
}

/**
 * Validates if the incoming parameter is a String.
 * @param n - Parameter for validation.
 * @param err - Custom Error Message.
 */
export function validateString(n: string, err?: string): void {
  if (typeof n !== "string") {
    throw new ValidationError(err || "Expected a string value");
  }
}

/**
 * Validates if the incoming parameters are Equal.
 * @param first - First Parameter for validation.
 * @param second - Second Parameter for validation.
 * @param err - Custom Error Message.
 */
export function validateEquality(
  first: string | number | boolean | symbol,
  second: string | number | boolean | symbol,
  err?: string
) {
  if (first !== second) {
    throw new ValidationError(
      err || `Expected ${first.toString()} to be equal to ${second.toString()}.`
    );
  }
}

/**
 * Validates if the incoming parameters are Not Equal.
 * @param first - First Parameter for validation.
 * @param second - Second Parameter for validation.
 * @param err - Custom Error Message.
 */
export function validateInEquality(
  first: string | number | boolean | symbol,
  second: string | number | boolean | symbol,
  err?: string
) {
  if (first === second) {
    throw new ValidationError(
      err ||
        `Expected ${first.toString()} to not be equal to ${second.toString()}.`
    );
  }
}

/**
 * Validates if the incoming first parameter is Lesser Than or Equals to the incoming second parameter.
 * @param first - First Parameter for validation.
 * @param second - Second Parameter for validation.
 * @param err - Custom Error Message.
 */
export function validateLessOrEqual(
  first: number,
  second: number,
  err?: string
) {
  if (first > second) {
    throw new ValidationError(
      err || `Expected ${first} to be less than or equal to ${second}.`
    );
  }
}

/**
 * Validates if the incoming first parameter Greater Than the incoming second parameter.
 * @param first - First Parameter for validation.
 * @param second - Second Parameter for validation.
 * @param err - Custom Error Message.
 */
export function validateGreater(first: number, second: number, err?: string) {
  if (first <= second) {
    throw new ValidationError(
      err || `Expected ${first} to be greater than ${second}.`
    );
  }
}

/**
 * Validates if the incoming parameter is True.
 * @param arg - Parameter for validation.
 * @param err - Custom Error Message.
 */
export function validateTruth(arg: boolean | null | undefined, err?: string) {
  if (arg == null || arg === false) {
    throw new ValidationError(err || "Expected a Truth value");
  }
}

/**
 * Validates if the incoming parameter is False.
 * @param arg - Parameter for validation.
 * @param err - Custom Error Message.
 */
export function validateFalse(arg: boolean | null | undefined, err?: string) {
  if (arg === true) {
    throw new ValidationError(err || "Expected a False value");
  }
}

/**
 * Evokes error when called.
 * This should be placed before any in-accessable code to ensure not to get called.
 * @param err - Custom Error Message.
 */
export function shouldNotGetCalled(err?: string): void {
  throw new NoopError(
    err || "This method should not get called or has no operation to perform"
  );
}

/**
 * Evokes error when called.
 * This should be placed before any invalid event listener.
 * @param event - Name of the Event.
 * @param err - Custom Error Message.
 */
export function shouldNotBeListenedTo(event: string, err?: string): void {
  throw new InvalidEventError(
    err || `Unknown event ${event} to add/remove listener for given object`
  );
}

/**
 * Evokes error when called.
 * This function should be called when a set of Operation is recieved in an incorrect order.
 * @param err - Custom Error Message.
 */
export function shouldNotBeComposedOrApplied(err?: string): void {
  throw new InvalidOperationOrderError(
    err ||
      "Invalid order of operation recieved that cannot be composed or applied"
  );
}

/**
 * Evokes error when called.
 * This function should be called when Database Transaction fails.
 * @param err - Custom Error Message.
 */
export function onFailedDatabaseTransaction(err?: string): void {
  throw new DatabaseTransactionError(err || "Transaction Failure!");
}

/**
 * Evokes error when called.
 * This function should be called when an invalid Operation is recieved.
 * @param err - Custom Error Message.
 */
export function onInvalidOperationRecieve(err?: string): void {
  throw new InvalidOperationError(err || "Invalid operation recieved!");
}

/**
 * Converts color code from RGB format to Hexadecimal format.
 * @param red - Color depth of Red pigment (0 to 1).
 * @param blue - Color depth of Blue pigment (0 to 1).
 * @param green - Color depth of Green pigment (0 to 1).
 */
export function rgbToHex(red: number, blue: number, green: number): string {
  const depth = [red, blue, green].map((color) =>
    Math.round(255 * color)
      .toString(16)
      .padStart(2, "0")
  );

  return ["#", ...depth].join("");
}

/**
 * Converts color code from Hexadecimal format to RGB format.
 * @param hex - Hexadecimal represenation of color.
 */
export function hexToRgb(hex: string): Array<number> {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result) {
    return [0, 0, 0];
  }

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

function hueToRgb(
  degree: number,
  percentage1: number,
  percentage2: number
): number {
  if (degree < 0) {
    degree += 1;
  }

  if (degree > 1) {
    degree -= 1;
  }

  if (6 * degree < 1) {
    return percentage1 + (percentage2 - percentage1) * 6 * degree;
  }

  if (2 * degree < 1) {
    return percentage2;
  }

  if (3 * degree < 2) {
    return percentage1 + (percentage2 - percentage1) * 6 * (2 / 3 - degree);
  }

  return percentage1;
}

/**
 * Converts color code from HSL format to Hexadecimal format.
 * @param hue - Hue of the color.
 * @param saturation - Saturation of the color.
 * @param lightness - Brightness of the color.
 */
export function hslToHex(
  hue: number,
  saturation: number,
  lightness: number
): string {
  if (saturation === 0) {
    return rgbToHex(lightness, lightness, lightness);
  }

  const percentage2 =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - saturation * lightness;
  const percentage1 = 2 * lightness - percentage2;

  return rgbToHex(
    hueToRgb(hue + 1 / 3, percentage1, percentage2),
    hueToRgb(hue, percentage1, percentage2),
    hueToRgb(hue - 1 / 3, percentage1, percentage2)
  );
}

/**
 * Generates a color code based on User Id provided.
 * This is used as default value if explicit color is not given.
 * @param userId - String representation of the User Id.
 */
export function colorFromUserId(userId: string) {
  let a = 1;

  for (let i = 0; i < userId.length; i++) {
    a = (17 * (a + userId.charCodeAt(i))) % 360;
  }

  const hue = a / 360;

  return hslToHex(hue, 1, 0.75);
}

/**
 * Capitalises first letter of the given text.
 * @param text - Incoming Text segment.
 */
export function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
