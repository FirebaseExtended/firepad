import { SortedMap } from '../util/SortedMap';
import { NamedNode } from './Node';
/**
 * Takes a list of child nodes and constructs a SortedSet using the given comparison
 * function
 *
 * Uses the algorithm described in the paper linked here:
 * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.46.1458
 *
 * @template K, V
 * @param {Array.<!NamedNode>} childList Unsorted list of children
 * @param {function(!NamedNode, !NamedNode):number} cmp The comparison method to be used
 * @param {(function(NamedNode):K)=} keyFn An optional function to extract K from a node wrapper, if K's
 *                                                        type is not NamedNode
 * @param {(function(K, K):number)=} mapSortFn An optional override for comparator used by the generated sorted map
 * @return {SortedMap.<K, V>}
 */
export declare const buildChildSet: <K, V>(childList: NamedNode[], cmp: (a: NamedNode, b: NamedNode) => number, keyFn?: (a: NamedNode) => K, mapSortFn?: (a: K, b: K) => number) => SortedMap<K, V>;
