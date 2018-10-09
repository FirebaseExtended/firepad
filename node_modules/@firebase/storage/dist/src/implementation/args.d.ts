/**
 * @param name Name of the function.
 * @param specs Argument specs.
 * @param passed The actual arguments passed to the function.
 * @throws {fbs.Error} If the arguments are invalid.
 */
export declare function validate(name: string, specs: ArgSpec[], passed: IArguments): void;
/**
 * @struct
 */
export declare class ArgSpec {
    validator: (p1: any) => void;
    optional: boolean;
    constructor(validator: (p1: any) => void, opt_optional?: boolean);
}
export declare function and_(v1: (p1: any) => void, v2: Function): (p1: any) => void;
export declare function stringSpec(opt_validator?: (p1: any) => void | null, opt_optional?: boolean): ArgSpec;
export declare function uploadDataSpec(): ArgSpec;
export declare function metadataSpec(opt_optional?: boolean): ArgSpec;
export declare function nonNegativeNumberSpec(): ArgSpec;
export declare function looseObjectSpec(opt_validator?: ((p1: any) => void) | null, opt_optional?: boolean): ArgSpec;
export declare function nullFunctionSpec(opt_optional?: boolean): ArgSpec;
