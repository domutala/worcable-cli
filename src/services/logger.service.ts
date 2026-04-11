import pc from "picocolors";
import yoctoSpinner from "yocto-spinner";

type pcBgColorFnName =
  | "bgBlack"
  | "bgRed"
  | "bgGreen"
  | "bgYellow"
  | "bgBlue"
  | "bgMagenta"
  | "bgCyan"
  | "bgWhite";

function fn(...vals: string[]) {
  const val = `${vals.join("\n")}`;
  return {
    val,
    log() {
      console.log(val);
    },
  };
}

export const logger = {
  log(...vals: string[]) {
    fn(...vals).log();
  },

  // Main section titles: Big, bold, and clear
  title(title: string) {
    return fn(
      `${pc.cyan("┌" + "─".repeat(title.length + 4) + "┐")}`,
      `${pc.cyan("│")}  ${pc.bold(pc.white(title))}  ${pc.cyan("│")}`,
      `${pc.cyan("└" + "─".repeat(title.length + 4) + "┘")}\n`
    );
  },

  accent(
    steps:
      | (string | { val: string; color: pcBgColorFnName })[]
      | (string | { val: string; color: pcBgColorFnName })
  ) {
    steps = Array.isArray(steps) ? steps : [steps];

    const steper = steps
      .map((step) => {
        const fn = typeof step === "string" ? "bgCyan" : step.color;
        const val = typeof step === "string" ? step : step.val;

        return pc.bgCyan(pc[fn](pc.bold(` ${val.toUpperCase()} `)));
      })
      .join(" ");

    return fn(steper);
  },

  step(step: string[] | string, label: string) {
    step = this.accent(step).val;

    return fn(`${step} ${pc.cyan(label)}`);
  },

  // Informational: For hints or descriptions under a title
  info(message: string) {
    return fn(`${pc.dim("  ℹ " + message)}`);
  },

  // Success: For when a configuration step is done
  success(message: string) {
    return fn(`${pc.bgGreen(pc.black(pc.bold(` ✔ `)))} ${pc.green(message)}`);
  },

  // A simple horizontal line for visual breathing room
  spacer() {
    return fn(pc.dim(".".repeat(50)), "\n");
  },

  process(text: string) {
    const s = yoctoSpinner({
      text: pc.cyan(text),
    }).start();

    return {
      success: (msg?: string) => s.success(pc.green(msg || text)),
      error: (msg?: string) => s.error(pc.red(msg || text)),
      stop: () => s.stop(),
      update: (newText: string) => {
        s.text = pc.cyan(newText);
      },
    };
  },
};
