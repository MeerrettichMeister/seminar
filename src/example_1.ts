import {PartTemplate} from "./data-structures";


/**
 * Der Nutzer soll über einen Dialog einen neuen Auspuff im System anlegen können.
 * In einem FormField wird der Standartname angezeigt, welcher der Nutzer ändern kann.
 */

const displayedName = PartTemplate.EXHAUST_TEMPLATE.name.de

/**
 * Binding erfolgt über model() Signal (Read & Write)
 */

const userInput = "Hochleistungsfedern 1-15"

/**
 * Binding bewirkt implizite Überschreibung des Templates.
 * Das wollten wir aber eigentlich garnicht.
 */

PartTemplate.EXHAUST_TEMPLATE.name.de = userInput

/**
 * Der Nutzer bekommt davon nichts mit.
 * Mit Bestätigung des Dialoges wird ein neues Teil angelegt.
 */

