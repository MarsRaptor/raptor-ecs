export class Entity {
    uid: number;
    systemIndexes: Set<number>;
    constructor(uid: number) {
        this.uid=uid;
        this.systemIndexes= new Set<number>();
    }
}