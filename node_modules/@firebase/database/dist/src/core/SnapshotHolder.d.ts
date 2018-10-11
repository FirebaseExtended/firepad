import { Path } from './util/Path';
import { Node } from './snap/Node';
/**
 * Mutable object which basically just stores a reference to the "latest" immutable snapshot.
 *
 * @constructor
 */
export declare class SnapshotHolder {
    private rootNode_;
    getNode(path: Path): Node;
    updateSnapshot(path: Path, newSnapshotNode: Node): void;
}
