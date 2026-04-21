import {NonWritable} from "./non-writable";

const LANGUAGE_CODES = ["en", "es", "de", "fr", "it"] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export type MultilanguageString = Partial<{ [key in LanguageCode]: String }>

export type PartCategory = "springs" | "rims" | "exhaust" | "window"


export class CarPart {
    public constructor(private _name: MultilanguageString, private _partType: PartCategory,
                       private _compatibleBrands: string[]
    ) {
    }

    get name(): MultilanguageString {
        return this._name;
    }

    set name(value: MultilanguageString) {
        this._name = value;
    }

    get partType(): PartCategory {
        return this._partType;
    }

    set partType(value: PartCategory) {
        this._partType = value;
    }

    get compatibleBrands(): string[] {
        return this._compatibleBrands;
    }

    set compatibleBrands(value: string[]) {
        this._compatibleBrands = value;
    }
}

export class PartTemplate {
    public static readonly SPRINGS_TEMPLATE: CarPart = new CarPart({de: "Feder"}, "springs", [])
    public static readonly RIMS_TEMPLATE: CarPart = new CarPart({de: "Felge"}, "rims", [])
    public static readonly EXHAUST_TEMPLATE: CarPart = new CarPart({de: "Auspuff"}, "exhaust", [])
    public static readonly WINDOW_TEMPLATE: CarPart = new CarPart({de: "Scheibe"}, "window", [])

    public newPartFromTemplate(template: CarPart): CarPart {
        return structuredClone(template)
    }

}