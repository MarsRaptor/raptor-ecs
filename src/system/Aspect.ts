import { SharesProps, IsEmpty } from "../util/UtilTypes";
import { ComponentManagerDescriptor, ComponentManager } from "../component/ComponentManager";
import { Entity } from "../entity/Entity";

export class Aspect<EXPECTED, EXCLUDED, OPTIONAL>{

    private expectedKeys: string[];
    private excludedKeys: string[];

    constructor(aspectDescriptor: AspectDescriptor<EXPECTED, EXCLUDED, OPTIONAL>) {
        this.expectedKeys = aspectDescriptor.expected !== null ? Object.getOwnPropertyNames(aspectDescriptor.expected) : [];
        this.excludedKeys = aspectDescriptor.excluded !== null ? Object.getOwnPropertyNames(aspectDescriptor.excluded) : [];
    }

    validate(CTX_COMPONENTS: ComponentManagerDescriptor<EXPECTED & EXCLUDED & OPTIONAL>, entity: Entity): boolean {
        for (let index = 0; index < this.expectedKeys.length; index++) {
            if (!((CTX_COMPONENTS as any)[this.expectedKeys[index]] as ComponentManager<any>).has(entity)) {
                return false;
            }
        }
        for (let index = 0; index < this.excludedKeys.length; index++) {
            if (((CTX_COMPONENTS as any)[this.excludedKeys[index]] as ComponentManager<any>).has(entity)) {
                return false;
            }
        }
        return true;
    }

}

export class AspectHolder<T> { useAspectHolderForTypeInferance!: T; constructor() { } };
export type AspectDescriptor<EXPECTED, EXCLUDED, OPTIONAL> =
    SharesProps<EXPECTED, EXCLUDED> extends true ? never :
    SharesProps<EXPECTED, OPTIONAL> extends true ? never :
    SharesProps<EXCLUDED, OPTIONAL> extends true ? never :
    {
        expected: IsEmpty<EXPECTED> extends true ? null : { [P in keyof EXPECTED]: AspectHolder<EXPECTED[P]> },
        excluded: IsEmpty<EXCLUDED> extends true ? null : { [P in keyof EXCLUDED]: AspectHolder<EXCLUDED[P]> },
        optional: IsEmpty<OPTIONAL> extends true ? null : { [P in keyof OPTIONAL]: AspectHolder<OPTIONAL[P]> }
    }
