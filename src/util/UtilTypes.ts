export type IsEmpty<T> = keyof T extends never ? true : false;
export type Empty<T> = IsEmpty<T> extends true ? T : never;
export type NotEmpty<T> = IsEmpty<T> extends false ? T : never;
export type IsEqual<T, U> = Exclude<keyof T, keyof U> extends never ? Exclude<keyof T, keyof U> extends never ? true : false : false;
export type SharesProps<T, U> = Extract<keyof T, keyof U> extends never ? false : true;