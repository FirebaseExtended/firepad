import { Path } from './Path';
/**
 * Node in a Tree.
 */
export declare class TreeNode<T> {
    children: {
        [name: string]: TreeNode<T>;
    };
    childCount: number;
    value: T | null;
}
/**
 * A light-weight tree, traversable by path.  Nodes can have both values and children.
 * Nodes are not enumerated (by forEachChild) unless they have a value or non-empty
 * children.
 */
export declare class Tree<T> {
    private name_;
    private parent_;
    private node_;
    /**
     * @template T
     * @param {string=} name_ Optional name of the node.
     * @param {Tree=} parent_ Optional parent node.
     * @param {TreeNode=} node_ Optional node to wrap.
     */
    constructor(name_?: string, parent_?: Tree<T> | null, node_?: TreeNode<T>);
    /**
     * Returns a sub-Tree for the given path.
     *
     * @param {!(string|Path)} pathObj Path to look up.
     * @return {!Tree.<T>} Tree for path.
     */
    subTree(pathObj: string | Path): Tree<T>;
    /**
     * Returns the data associated with this tree node.
     *
     * @return {?T} The data or null if no data exists.
     */
    getValue(): T | null;
    /**
     * Sets data to this tree node.
     *
     * @param {!T} value Value to set.
     */
    setValue(value: T): void;
    /**
     * Clears the contents of the tree node (its value and all children).
     */
    clear(): void;
    /**
     * @return {boolean} Whether the tree has any children.
     */
    hasChildren(): boolean;
    /**
     * @return {boolean} Whether the tree is empty (no value or children).
     */
    isEmpty(): boolean;
    /**
     * Calls action for each child of this tree node.
     *
     * @param {function(!Tree.<T>)} action Action to be called for each child.
     */
    forEachChild(action: (tree: Tree<T>) => void): void;
    /**
     * Does a depth-first traversal of this node's descendants, calling action for each one.
     *
     * @param {function(!Tree.<T>)} action Action to be called for each child.
     * @param {boolean=} includeSelf Whether to call action on this node as well. Defaults to
     *   false.
     * @param {boolean=} childrenFirst Whether to call action on children before calling it on
     *   parent.
     */
    forEachDescendant(action: (tree: Tree<T>) => void, includeSelf?: boolean, childrenFirst?: boolean): void;
    /**
     * Calls action on each ancestor node.
     *
     * @param {function(!Tree.<T>)} action Action to be called on each parent; return
     *   true to abort.
     * @param {boolean=} includeSelf Whether to call action on this node as well.
     * @return {boolean} true if the action callback returned true.
     */
    forEachAncestor(action: (tree: Tree<T>) => void, includeSelf?: boolean): boolean;
    /**
     * Does a depth-first traversal of this node's descendants.  When a descendant with a value
     * is found, action is called on it and traversal does not continue inside the node.
     * Action is *not* called on this node.
     *
     * @param {function(!Tree.<T>)} action Action to be called for each child.
     */
    forEachImmediateDescendantWithValue(action: (tree: Tree<T>) => void): void;
    /**
     * @return {!Path} The path of this tree node, as a Path.
     */
    path(): Path;
    /**
     * @return {string} The name of the tree node.
     */
    name(): string;
    /**
     * @return {?Tree} The parent tree node, or null if this is the root of the tree.
     */
    parent(): Tree<T> | null;
    /**
     * Adds or removes this child from its parent based on whether it's empty or not.
     *
     * @private
     */
    private updateParents_();
    /**
     * Adds or removes the passed child to this tree node, depending on whether it's empty.
     *
     * @param {string} childName The name of the child to update.
     * @param {!Tree.<T>} child The child to update.
     * @private
     */
    private updateChild_(childName, child);
}
