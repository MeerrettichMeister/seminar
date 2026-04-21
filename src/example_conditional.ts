type MyString = string

type IHateStrings<Type> = Type extends string ? never : Type;

const foo: IHateStrings<boolean> = false
// Valide da boolean nicht von string erbt.

const bar: IHateStrings<MyString> = "Test"
// Code kompiliert nicht: "TS2322: Type "Test" is not assignable to type never"