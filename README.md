# Seminar: Expressive Types in TypeScript

## Problemstellung

### Simpel

Wir haben einen simplen Typ, welcher Ländercodes auf Strings abbildet.
```ts
const LANGUAGE_CODES = ["en", "es", "de", "fr", "it"] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export type MultilanguageString = Partial<{ [key in LanguageCode]: String }>

export const greetings:MultilanguageString = {en: "Hello", es: "Hola", de: "Hallo", fr: "Bonjour", it: "Ciao"}
```
Wir möchten nun verhindern, dass andere Entwickler ausversehen die vordefinierten Begrüßungen überschreiben,  
und sollten Sie dies doch tun, dann soll der Code nicht kompilieren.

### Exemplarisch

Wir betrachten eine Anwendung zur Verwaltung eines Kfz Teilekataloges von einem Unternehmen, welches
Ersatzteile produziert.

Zum Anlegen neuer Ersatzteile kann ein Mitarbeiter Vorlagen verwenden, um das neue Ersatzteil schneller im System
hinzuzufügen.
```ts
export class PartTemplate {
  public static readonly SPRINGS_TEMPLATE: CarPart = new CarPart({de: "Feder"}, "springs", [])
  public static readonly RIMS_TEMPLATE: CarPart = new CarPart({de: "Felge"}, "rims", [])
  public static readonly EXHAUST_TEMPLATE: CarPart = new CarPart({de: "Auspuff"}, "exhaust", [])
  public static readonly WINDOW_TEMPLATE: CarPart = new CarPart({de: "Scheibe"}, "window", [])

  public static newPartFromTemplate(template: CarPart): CarPart {
    return structuredClone(template)
  }

}
```
Aufgrund eines Entwicklungsfehlers führen Nutzereingaben in der Maske dazu, dass die Namen des Ersatzteils in der
Vorlage überschreiben werden, und somit an anderen Stellen der Anwendung zu fehlern führen.

![Beispielablauf](/src/img/CarPart_Sequence.png)

```ts
import {CarPart, PartTemplate} from "./data-structures";


/**
 * Der Nutzer soll über einen Dialog einen neuen Auspuff im System anlegen können.
 * In einem FormField wird der Standartname angezeigt, welcher der Nutzer ändern kann.
 */

const displayedName = PartTemplate.EXHAUST_TEMPLATE.name.de

/**
 * Binding erfolgt über model() Signal (Read & Write)
 */

const userInput = "Hochleistungsauspuff 1-15"

/**
 * Binding bewirkt implizite Überschreibung des Templates.
 * Das wollten wir aber eigentlich garnicht.
 */

// Implizit
PartTemplate.EXHAUST_TEMPLATE.name.de = userInput

/**
 * Der Nutzer bekommt davon nichts mit.
 * Mit Bestätigung des Dialoges wird ein neues Teil angelegt.
 */

const newExhaust = PartTemplate.newPartFromTemplate(PartTemplate.EXHAUST_TEMPLATE)
newExhaust.name.de = userInput;
```

Die betreffende Stelle im Quellcode konnte schnell abgeändert werden, um den Fehler zu beheben.  
Idealerweise würden wir jedoch Code schreiben wollen, welcher solche Fehler beim Entwickeln bereits verhindert.  
Wie könnte man so etwas lösen?

## Naive Lösung

- Wir setzen die Felder des Typs `MultilanguageString` auf `readonly`  
  Nicht machbar, da einerseits nicht gewährleistet ist, dass an anderen Stellen im Code ein Eintrag in einem
  `MultilanguageString` nicht abgeändert werden muss und somit die Anwendung nicht mehr zuverlässig arbeitet.  
  Des Weiteren können notwendige Datenstrukturen aus fremden Bibliotheken stammen bei welchen die Anpassung des
  Quelltextes nicht möglich ist.
- Wir erzeugen Duplikate der Klassen und setzen dort alle Attribute auf `readonly` und erzeugen somit eine Immutable
  Variante der Klasse.  
  Analoges Problem mit Datentypen aus fremden Bibliotheken.  
  Durch die duplizierte Logik entsteht schlechterer wartbarer Code.

## Klügere Lösung

### `NonWritable<Type>`

Wir definieren einen eigenen neuen generischen Type, welcher den Datentyp kapselt, welchen wir vor Schreibzugriffen
schützen wollen.

```ts
export type NonWritable<T> = T extends Object ? Readonly<{ [Property in keyof T]: NonWritable<T[Property]> }> : T
```

Hierbei machen wir uns mehrere Sprachfeatures von TypeScript, sowie generelle Programmierkonzepte zunutze.

### Generics

Wir verwenden Generics, um innerhalb unseres Typs Entscheidungslogik auszuführen, als auch um Typinferenz zu
ermöglichen.

### `Readonly<T>`

Der Typ `Readonly<T>` ist ein Typ, welcher von TypeScript standartmäßig innerhalb der Gruppe der Utility Types
bereitgestellt wird.  
Durch den Typ ist man in der Lage Datentypen zu Kapseln und zur Compile Time Schreibzugriff auf die Attribute des
Datentyps zu verhindern.

```ts
const names: MultilanguageString = {de: "Guten Morgen", en: "Good morning"}
names.de = "Guten Abend"
// Code kompiliert Problemlos

const lockedNames: Readonly<MultilanguageString> = {de: "Guten Morgen", en: "Good morning"}
lockedNames.de = "Guten Abend"
// Code kompiliert nicht: "TS2540: Cannot assign to de because it is a read-only property."
```

### Mapped Types

TypeScript besitzt ein Sprachfeature mit dem Namen "Mapped Types".  
Dieses Feature ermöglicht es über die Attribute (`Property` gennant) eines Typs zu itereieren und diesen Attributen
unter anderem neue Typen zuzuweisen.

```ts
interface Name {
    fistName: string;
    surName: string;
}

type Booleanize<Type> = { [Property in keyof Type]: boolean }

const myName: Booleanize<Name> = {fistName: "John", surName: "Doe"}
```

### Conditonal Types

Wie aus gängigen Programmiersprachen bekannt, ist auch in TypeScript der Konditionaloperator verfügbar.

```ts
const isPink = color.isPink() ? "Pink" : "Nicht Pink"
// isPink hat Wert "Pink" wenn isPink() true zurückgibt
```

Zusätzlich zum normalen Kontrollfluss ist der Operator auch auf Typen verwendbar.  
Somit sind wir in der Lage Entscheidungen basierend auf dem Typen zu treffen, sowohl auf konkreten Typen als auch auf
Generics.

```ts
type MyString = string

type IHateStrings<Type> = Type extends string ? never : Type;

const foo: IHateStrings<boolean> = false
// Valide da boolean nicht von string erbt.

const bar: IHateStrings<MyString> = "Test"
// Code kompiliert nicht: "TS2322: Type "Test" is not assignable to type never"

```

### Erkenntnis
Mit den nun etablierten Sprachfeatures können wir jetzt unseren definierten Typ zerlegen und nachvollziehen wie dieser funktioniert.  
```ts
export type NonWritable<T> = T extends Object ? Readonly<{ [Property in keyof T]: NonWritable<T[Property]> }> : T
```
Wir betrachten als Erstes ob unser generischer Typ `T` von dem Typ `Object` erbt, also ob es sich um ein Primitiv handelt.  
Im Falle eines primitiven Typs können wir diesen unverändert lassen, da dieser keine Attribute besitzt, welche auf `readonly` gesetzt werden können.  
Andernfalls Kapseln wir den Typ mit dem `Readonly<T>` und mappen die Attribute des Typs ebenfalls auf unseren definierten Typ.  
Auf diese steigen wir rekursiv die Typhierarchie ab und setzen alle Attribute die existieren auf `readonly`, somit erreichen wir völlige Schreibsperre für jeden beliebig komplexen Datentyp.

## Anwendung

### Beispiel Simpel

```ts
export class SomeClass {
  public static readonly greetings:MultilanguageString = {en: "Hello", es: "Hola", de: "Hallo", fr: "Bonjour", it: "Ciao"}

}

export class SomeClass2 {
  public static readonly greetings:NonWritable<MultilanguageString> = {en: "Hello", es: "Hola", de: "Hallo", fr: "Bonjour", it: "Ciao"}

}

SomeClass.greetings.de = "Tschüss"

SomeClass2.greetings.de = "Tschüss"
// TS2540: Cannot assign to de because it is a read-only property.
```
Die Einträge in `SomeClass.greetings` können geändert werden, was nicht erwünscht ist.  
Die Einträge in `SomeClass2.greetings` sind hingegen wie gewollt `readonly`


### Beispiel CarPart
```ts
import {CarPart, PartTemplate} from "./data-structures";


/**
 * Der Nutzer soll über einen Dialog einen neuen Auspuff im System anlegen können.
 * In einem FormField wird der Standartname angezeigt, welcher der Nutzer ändern kann.
 */

const displayedName = PartTemplate.EXHAUST_TEMPLATE.name.de

/**
 * Binding erfolgt über model() Signal (Read & Write)
 */

const userInput = "Hochleistungsauspuff 1-15"

/**
 * Binding bewirkt implizite Überschreibung des Templates.
 * Das wollten wir aber eigentlich garnicht.
 */

// Implizit
PartTemplate.EXHAUST_TEMPLATE.name.de = userInput
// TS2540: Cannot assign to de because it is a read-only property.
// Fehler wurde erfolgreich zur Compiletime erkannt

const newExhaust = PartTemplate.newPartFromTemplate(PartTemplate.EXHAUST_TEMPLATE as CarPart)
// Entwickler muss NonWritables explizit an Methoden übergeben die kein NonWritable<> erwarten.
newExhaust.name.de = userInput;

```

### Referenzen

https://www.typescriptlang.org/docs/handbook/2/generics.html  
https://www.typescriptlang.org/docs/handbook/utility-types.html  
https://www.typescriptlang.org/docs/handbook/2/mapped-types.html  
https://www.typescriptlang.org/docs/handbook/2/conditional-types.html  