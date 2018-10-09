import { Index } from './Index';
import { NamedNode, Node } from '../Node';
import { Path } from '../../util/Path';
/**
 * @param {!Path} indexPath
 * @constructor
 * @extends {Index}
 */
export declare class PathIndex extends Index {
    private indexPath_;
    constructor(indexPath_: Path);
    /**
     * @param {!Node} snap
     * @return {!Node}
     * @protected
     */
    protected extractChild(snap: Node): Node;
    /**
     * @inheritDoc
     */
    isDefinedOn(node: Node): boolean;
    /**
     * @inheritDoc
     */
    compare(a: NamedNode, b: NamedNode): number;
    /**
     * @inheritDoc
     */
    makePost(indexValue: object, name: string): NamedNode;
    /**
     * @inheritDoc
     */
    maxPost(): NamedNode;
    /**
     * @inheritDoc
     */
    toString(): string;
}
