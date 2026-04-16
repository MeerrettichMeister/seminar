const ALL_ACCESSORS = ["foo", "bar", "baz", "fizzbuzz", "bizzfuzz", "spam"] as const

type AccessorCode = (typeof ALL_ACCESSORS)[number]

type PartialDict<T> = Partial<{ [key in AccessorCode]: T }>

type WriteLocked<Type> = { + readonly [Property in keyof Type]: Type[Property] extends {} ? WriteLocked<Type[Property]> : Type[Property] }


class FunkyClass {


    constructor(public bigList: Array<string>, public accessRights: PartialDict<number>) {
    }
}

interface Coordinates {
    x: number;
    y: number;
}


interface Composition extends Coordinates {
    params: PartialDict<boolean>
}

function lockInterface<T>(element: T): WriteLocked<T> {
    return element as WriteLocked<T>
}

interface Giga {
    composed: Composition;
    obj: FunkyClass;
}


const myCoord1: Coordinates = {x: 1, y: 2}

const biggerObject: Composition = {
    x: 4, y: 8, params: {foo: true, spam: false}
}

const gigaObject: Giga = {
    composed: {params: {bizzfuzz: true, bar: false}, x: 18, y: -44},
    obj: new FunkyClass(["Guten", "Morgen"], {spam: 0})
}

const locked = lockInterface(myCoord1);
const lockedBig = lockInterface(biggerObject)
const lockedGiga = lockInterface(gigaObject);
const foo = locked.x
