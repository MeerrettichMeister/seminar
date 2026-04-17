export type NonWritable<Type> = Type extends Object ? Readonly<{ [Property in keyof Type]: NonWritable<Type[Property]> }> : Type
