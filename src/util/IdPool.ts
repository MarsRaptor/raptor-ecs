export class IdPool{
    private _count:number;
    private _maxCount:number;
    private _freeIDs:Set<number>;

    constructor(maxCount:number = Number.MAX_SAFE_INTEGER) {
        this._count = 0;
        this._maxCount = maxCount;
        this._freeIDs = new Set<number>();        
    }

    newID():number{
        if (this._freeIDs.size>0) {
            let id = this._freeIDs.values().next().value;
            this._freeIDs.delete(id);
            return id;
        } else if(this._count < this._maxCount){
            return this._count++;
        } else{
            throw new Error(`Max id limit reached [max: ${this._maxCount}]`);
        }
    }

    free(id:number) : void{
        this._freeIDs.add(id);
    }
}