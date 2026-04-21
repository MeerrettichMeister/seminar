interface Name {
    fistName: string;
    surName: string;
}

type Booleanize<Type> = { [Property in keyof Type]: boolean }

const myName: Booleanize<Name> = {fistName: "John", surName: "Doe"}
// Code kompiliert nicht: "TS2322: Type string is not assignable to type boolean"