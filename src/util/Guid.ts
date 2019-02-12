/**
 * This is a terrible GUID generator, conflicts are possible.
 * @FIXME Replace this utility
 */
export class BadGuid {
    public static uid(): string {
        return [BadGuid.gen(2), BadGuid.gen(1), BadGuid.gen(1), BadGuid.gen(1), BadGuid.gen(3)].join("-")
    }
    private static gen(count: number): string {
        let out: string = "";
        for (let i: number = 0; i < count; i++) {
            out += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return out;
    }
}