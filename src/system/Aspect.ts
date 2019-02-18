import { SharesProps, IsEmpty } from "../util/UtilTypes";

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
