import {MultilanguageString} from "./data-structures";


const names: MultilanguageString = {de: "Guten Morgen", en: "Good morning"}
names.de = "Guten Abend"
// Code kompiliert Problemlos

const lockedNames: Readonly<MultilanguageString> = {de: "Guten Morgen", en: "Good morning"}
lockedNames.de = "Guten Abend"
// Code kompiliert nicht: "TS2540: Cannot assign to de because it is a read-only property."