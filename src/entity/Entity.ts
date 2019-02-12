import { BadGuid } from "../util/Guid";

export class Entity {
    uid: string = BadGuid.uid();
    systemIndexes: Set<number> = new Set<number>();
}