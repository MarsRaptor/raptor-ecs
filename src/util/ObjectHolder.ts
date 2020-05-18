import { fastSplice } from "./ArrayUtils";

export abstract class ObjectHolder<T>{
    elements: Array<T>

    constructor() {
        this.elements = [];
    }

    get(index: number): T {
        return this.elements[index];
    }

    has(element: T | number): boolean {
        for (let i = 0; i < this.elements.length; i++) {
            if (element == this.elements[i]) {
                return true;
            }
        }
        return false;
    }

    abstract add(element: T): void;
    abstract del(element: T | number): void;
}

export class SimpleObjectHolder<T> extends ObjectHolder<T> {
    add(element: T): void {
        if (this.elements.indexOf(element) < 0) {
            this.elements.push(element);
        }
    }

    del(element: T | number): void {
        for (let i = 0; i < this.elements.length; i++) {
            if (element == this.elements[i]) {
                fastSplice(this.elements, i);
            }
        }
    }
}