import { Path } from '../util/Path';
import { Operation, OperationSource, OperationType } from './Operation';
import { ImmutableTree } from '../util/ImmutableTree';
export declare class AckUserWrite implements Operation {
    /**@inheritDoc */ path: Path;
    /**@inheritDoc */ affectedTree: ImmutableTree<boolean>;
    /**@inheritDoc */ revert: boolean;
    /** @inheritDoc */
    type: OperationType;
    /** @inheritDoc */
    source: OperationSource;
    /**
     *
     * @param {!Path} path
     * @param {!ImmutableTree<!boolean>} affectedTree A tree containing true for each affected path. Affected paths can't overlap.
     * @param {!boolean} revert
     */
    constructor(
        /**@inheritDoc */ path: Path, 
        /**@inheritDoc */ affectedTree: ImmutableTree<boolean>, 
        /**@inheritDoc */ revert: boolean);
    /**
     * @inheritDoc
     */
    operationForChild(childName: string): AckUserWrite;
}
