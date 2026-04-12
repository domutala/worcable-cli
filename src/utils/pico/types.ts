export type PcModifier =
  | "bold"
  | "italic"
  | "underline"
  | "dim"
  | "inverse"
  | "hidden"
  | "strikethrough"
  | "reset";

export type PcColor =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray"
  | "default";

export type PcBgColor =
  | "bgBlack"
  | "bgRed"
  | "bgGreen"
  | "bgYellow"
  | "bgBlue"
  | "bgMagenta"
  | "bgCyan"
  | "bgWhite";

export type PcToken = PcModifier | PcColor | PcBgColor;

export type ParsedPc = {
  bgColor?: PcBgColor;
  color?: PcColor;
  modifiers: PcModifier[];
  input: string;
};

export type PcChain =
  | PcColor
  | `${PcColor}:${PcModifier}`
  | `${PcColor}:${PcModifier}:${PcModifier}`

  // bg color
  | PcBgColor
  | `${PcBgColor}:${PcColor}`
  | `${PcBgColor}:${PcColor}:${PcModifier}`
  | `${PcBgColor}:${PcColor}:${PcModifier}:${PcModifier}`
  | `${PcBgColor}:${PcModifier}`
  | `${PcBgColor}:${PcModifier}:${PcModifier}`

  // modifier
  | PcModifier
  | `${PcModifier}:${PcModifier}`;

export type PicoBuilder = {
  text: (input: string) => string;
} & {
  [K in PcToken]: () => PicoBuilder;
};

export const BG_COLORS = new Set<PcBgColor>([
  "bgBlack",
  "bgRed",
  "bgGreen",
  "bgYellow",
  "bgBlue",
  "bgMagenta",
  "bgCyan",
  "bgWhite",
]);

export const COLORS = new Set<PcColor>([
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "gray",
  "default",
]);

export const MODIFIERS = new Set<PcModifier>([
  "bold",
  "italic",
  "underline",
  "dim",
  "inverse",
  "hidden",
  "strikethrough",
]);

export const VALID_TOKENS: PcToken[] = [
  "bold",
  "italic",
  "underline",
  "dim",
  "inverse",
  "hidden",
  "strikethrough",
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "gray",
  "default",
  "bgBlack",
  "bgRed",
  "bgGreen",
  "bgYellow",
  "bgBlue",
  "bgMagenta",
  "bgCyan",
  "bgWhite",
];
