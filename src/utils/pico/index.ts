import pc from "picocolors";
import {
  PcChain,
  PcToken,
  PcModifier,
  VALID_TOKENS,
  MODIFIERS,
  COLORS,
  PcColor,
  PcBgColor,
  BG_COLORS,
  ParsedPc,
} from "./types";

class Pico {
  private blocks: string[] = [];
  private groups: string[][] = [];

  private applyTokens(tokens: PcToken[], input: string): string {
    const parsed: ParsedPc = { input, modifiers: [] } as any;
    let result = input;

    for (const token of tokens) {
      if (this.isBgColor(token)) parsed.bgColor = token;
      else if (this.isColor(token)) parsed.color = token;
      else if (this.isModifier(token)) parsed.modifiers.push(token);
    }

    for (const modifier of parsed.modifiers) {
      result = pc[modifier](result);
    }

    if (parsed.color && parsed.color !== "default") {
      result = pc[parsed.color](result);
    }

    if (parsed.bgColor) {
      result = pc[parsed.bgColor](result);
    }

    return result;
  }

  private isModifier(token: PcToken): token is PcModifier {
    return MODIFIERS.has(token as PcModifier);
  }
  private isColor(token: PcToken): token is PcColor {
    return COLORS.has(token as PcColor);
  }
  private isBgColor(token: PcToken): token is PcBgColor {
    return BG_COLORS.has(token as PcBgColor);
  }

  private parse(style: PcChain, text: string) {
    const tokens = style.split(":") as PcToken[];
    const styled = this.applyTokens(tokens, text);
    this.blocks.push(styled);
    return this;
  }

  text(...text: string[]) {
    this.blocks.push(...text);
    return this;
  }

  render(style: PcChain, text: string) {
    return this.parse(style, text);
  }

  newline() {
    this.groups.push(this.blocks);
    this.blocks = [];
    return this;
  }

  private logger(log: (...data: any[]) => void) {
    const groups = this.groups;
    if (this.blocks.length) groups.push(this.blocks);
    groups.forEach((group) => log(...group));
  }

  log = () => {
    this.logger(console.log);
    return this;
  };

  debug = () => {
    this.logger(console.debug);
    return this;
  };

  info = () => {
    this.logger(console.info);
    return this;
  };

  warn = () => {
    this.logger(console.warn);
    return this;
  };

  error = () => {
    this.logger(console.error);
    return this;
  };

  trace = () => {
    this.logger(console.trace);
    return this;
  };

  clear = () => {
    this.groups = [];
    this.blocks = [];
    return this;
  };
}

export const pico = new Pico();
// pico
//   .render("green", "✔")
//   .render("dim", "dist/index.html")
//   .text("hello word")
//   .newline()
//   .render("green", "-")
//   .text("Shared API changes rebuild the library and app")
//   .log();

// ⮜ ⮞ ⮝ ⮟
// 🠴 🠶 🠵 🠷
// − ✔
