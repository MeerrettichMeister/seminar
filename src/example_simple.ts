import {MultilanguageString} from "./data-structures";
import {NonWritable} from "./non-writable";


export class SomeClass {
    public static readonly greetings:MultilanguageString = {en: "Hello", es: "Hola", de: "Hallo", fr: "Bonjour", it: "Ciao"}

}

export class SomeClass2 {
    public static readonly greetings:NonWritable<MultilanguageString> = {en: "Hello", es: "Hola", de: "Hallo", fr: "Bonjour", it: "Ciao"}

}

SomeClass.greetings.de = "Tschüss"

SomeClass2.greetings.de = "Tschüss"

