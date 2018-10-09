import { Node } from './Node';
export declare function setMaxNode(val: Node): void;
/**
 * @param {(!string|!number)} priority
 * @return {!string}
 */
export declare const priorityHashText: (priority: string | number) => string;
/**
 * Validates that a priority snapshot Node is valid.
 *
 * @param {!Node} priorityNode
 */
export declare const validatePriorityNode: (priorityNode: Node) => void;
