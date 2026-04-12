import { input, select } from "@inquirer/prompts";
import { ConfigManager } from "../../services/config.service";
import { IntallConfig } from "../types";
import pc from "picocolors";
import { logger } from "../../services/logger.service";
import * as z from "zod";
import { reverseProxyCommand } from "../../commands/reverse_proxy";

export type RPConfig = { use: boolean; url: string };

export async function askReverseProxy(
  config: IntallConfig
): Promise<IntallConfig> {
  const configManager = new ConfigManager<RPConfig>(
    ".worcable",
    "reverse-proxy.json"
  );
  let rpConfig = configManager.read();

  rpConfig = await ask();

  configManager.save(rpConfig);

  async function ask() {
    logger.step("config", `${pc.green("Reverse proxy")}`).log();

    const use = await select({
      message: "Use Worcable reverse proxy",
      choices: [
        { name: "No", value: false },
        { name: "Yes", value: true },
      ],
      default: rpConfig?.use,
    });

    let url = rpConfig?.url;

    if (use) {
      url = await input({
        message: "Choose your deployment method",
        validate(value) {
          const result = z.url().safeParse(value);

          if (!result.success) {
            return "Please enter a valid url";
          }

          return true;
        },
        default: rpConfig?.url ?? "http://localhost:4800",
      });
    }

    if (use) {
      await reverseProxyCommand();
    }

    return {
      use,
      url,
    } as RPConfig;
  }

  return { ...config, reverseProxy: rpConfig };
}
