import { input, select } from "@inquirer/prompts";
import { ConfigManager } from "../../services/config.service";
import type { Config, DeployMethod } from "../types";
import * as z from "zod";
import pc from "picocolors";
import { logger } from "../../services/logger.service";

export interface Options {
  deployMethod: DeployMethod;
  reverseProxy: "none" | "traefik" | "nginx";

  configDir: string;
  configPath: string;
  adminEmail: string;
}

export async function askOptions(config: Config): Promise<Config> {
  const configManager = new ConfigManager<Options>(
    ".worcable-reverse-proxy",
    "options.json"
  );
  let options = configManager.read();

  options = await ask();
  if (options) configManager.save(options);

  async function ask() {
    logger.step("config", `${pc.green("Options")}`).log();

    const deployMethod = await select({
      message: "Choose your deployment method",
      choices: [
        {
          name: "Docker",
          value: "docker",
          description: "Recommended - Isolated and reproducible",
        },
        {
          name: "Native",
          description: "Run directly on the host system",
          value: "native",
          disabled: "(Comming soon)",
        },
      ],
      default: options?.deployMethod ?? "docker",
    });

    const reverseProxy = await select({
      message: "Select Worcable version to install",
      choices: [
        { name: "nginx", value: "nginx" },
        { name: "traefik", value: "traefik", disabled: "(Under maintenance)" },
      ],
      default: options?.reverseProxy ?? "none",
    });

    const adminEmail = await input({
      message: "Admin email",
      default: options?.adminEmail,
      validate(value) {
        const result = z.email().safeParse(value);

        if (!result.success) {
          return "Please enter a valid email address (e.g., name@company.com)";
        }

        return true;
      },
    });

    return {
      deployMethod,
      reverseProxy,
      adminEmail,
      configDir: configManager.getDir(),
      configPath: configManager.getPath(),
    } as Options;
  }

  return { ...config, options: options! };
}
