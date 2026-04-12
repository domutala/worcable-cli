import pc from "picocolors";
import {
  BG_COLORS,
  COLORS,
  MODIFIERS,
  ParsedPc,
  PcBgColor,
  PcChain,
  PcColor,
  PcModifier,
  PcToken,
  PicoBuilder,
  VALID_TOKENS,
} from "./types";

export function isValidToken(value: string): value is PcToken {
  return VALID_TOKENS.includes(value as PcToken);
}

export function builder(): PicoBuilder {
  const tokens: PcToken[] = [];

  const handler: ProxyHandler<any> = {
    get(_, prop: string) {
      if (prop === "text") {
        return (input: string) => {
          let result = input;

          for (const token of tokens) {
            result = (pc as any)[token](result);
          }

          return result;
        };
      }

      // ajoute le token à la chaîne
      if (isValidToken(prop)) {
        tokens.push(prop as PcToken);
        return proxy;
      }

      throw new Error(`Invalid token: ${prop}`);
    },
  };

  const proxy = new Proxy({}, handler);
  return proxy as PicoBuilder;
}

export function parsePc(style: PcChain): ParsedPc {
  const tokens = style.split(":");

  const result: ParsedPc = {
    modifiers: [],
  } as any;

  for (const token of tokens) {
    if (BG_COLORS.has(token as PcBgColor)) {
      result.bgColor = token as PcBgColor;
      continue;
    }

    if (COLORS.has(token as PcColor)) {
      result.color = token as PcColor;
      continue;
    }

    if (MODIFIERS.has(token as PcModifier)) {
      result.modifiers.push(token as PcModifier);
      continue;
    }

    // sécurité (normalement impossible avec PcChain)
    throw new Error(`Invalid token: ${token}`);
  }

  return result;
}
