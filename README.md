# Seminar: Expressive Types in TypeScript

## Problemstellung

Wir betrachten eine Anwendung zur Verwaltung eines Kfz Teilekataloges von einem Unternehmen, welches
Ersatzteile produziert.

Zum Anlegen neuer Ersatzteile kann ein Mitarbeiter Vorlagen verwenden, um das neue Ersatzteil schneller im System
hinzuzufügen.

Aufgrund eines Entwicklungsfehlers führen Nutzereingaben in der Maske dazu, dass die Namen des Ersatzteils in der
Vorlage überschreiben werden, und somit an anderen Stellen der Anwendung zu fehlern führen.

Die betreffende Stelle im Quellcode konnte schnell abgeändert werden, um den Fehler zu beheben.  
Idealerweise würden wir jedoch Code schreiben wollen, welcher solche Fehler beim Entwickeln bereits verhindert.  
Wie könnte man so etwas lösen?

## Naive Lösung

- Wir setzen die Felder des Interface `MultilanguageString` auf `readonly`  
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
export type NonWritable<Type> = Type extends Object ? Readonly<{ [Property in keyof Type]: NonWritable<Type[Property]> }> : Type
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
export type NonWritable<Type> = Type extends Object ? Readonly<{ [Property in keyof Type]: NonWritable<Type[Property]> }> : Type
```
Wir betrachten als Erstes ob unser generischer Typ `Type` von dem Typ `Object` erbt, also ob es sich um ein Primitiv handelt.  
Im Falle eines primitiven Typs können wir diesen unverändert lassen, da dieser keine Attribute besitzt, welche auf `readonly` gesetzt werden können.  
Andernfalls Kapseln wir den Typ mit dem `Readonly<T>` und mappen die Attribute des Typs ebenfalls auf unseren definierten Typ.  
Auf diese steigen wir rekursiv die Typhierarchie ab und setzen alle Attribute die existieren auf `readonly`, somit erreichen wir völlige Schreibsperre für jeden beliebig komplexen Datentyp.

## Anwendung

Livedemo: Noch mit Code ersetzen.

### Referenzen

https://www.typescriptlang.org/docs/handbook/2/generics.html  
https://www.typescriptlang.org/docs/handbook/utility-types.html  
https://www.typescriptlang.org/docs/handbook/2/mapped-types.html  
https://www.typescriptlang.org/docs/handbook/2/conditional-types.html  