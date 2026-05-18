export type NonWritable<T> = T extends Object ? Readonly<{ [Property in keyof T]: NonWritable<T[Property]> }> : T
