import { input, select } from "@inquirer/prompts";
import { ConfigManager } from "../../services/config.service";
import { Config, UserConfig } from "../types";
import * as z from "zod";
import pc from "picocolors";
import { logger } from "../../services/logger.service";

export async function askUserInfo(config: Config): Promise<Config> {
  const configManager = new ConfigManager<UserConfig>(
    ".worcable",
    "config.json"
  );
  let userConfig = configManager.read();

  // if (userConfig) return { ...config, user: userConfig };

  userConfig = await ask();

  configManager.save(userConfig);
  logger.success(`Config saved at: ${configManager.getPath()}`).log();

  async function ask() {
    logger.step("config", `${pc.green("User")}`).log();
    const name = await input({
      message: "Your name",
      default: userConfig?.name,
    });

    const email = await input({
      message: "Your email",
      default: userConfig?.email,
      validate(value) {
        const result = z.string().email().safeParse(value);

        if (!result.success) {
          return "Please enter a valid email address (e.g., name@company.com)";
        }

        return true;
      },
    });

    logger.step("config", `${pc.green("Organisation")}`).log();

    const orgName = await input({
      message: "Organization name",
      default: userConfig?.orgName,
    });

    logger.step("config", `${pc.green("Deployment")}`).log();

    const baseUrl = await input({
      message: "Base url (example 'career.your-domain.com')",
      default: userConfig?.baseUrl ?? "localhost",
      validate(value) {
        const result = z
          .union([z.string().regex(z.regexes.domain), z.literal("localhost")])
          .safeParse(value);

        if (!result.success) {
          return "Please enter a valid domain name (e.g., domain.com) without 'http://' or 'https://'";
        }

        return true;
      },
    });

    const protocole = await select({
      message: "Select Worcable version to install",
      choices: [
        { name: "HTTPS", value: "https" },
        { name: "HTTP", value: "http" },
      ],
      default: userConfig?.protocole ?? "https",
    });

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
      default: userConfig?.deployMethod ?? "docker",
    });

    return {
      name,
      email,
      orgName,

      baseUrl,
      protocole,
      deployMethod,

      configDir: configManager.getDir(),
      configPath: configManager.getPath(),
    } as UserConfig;
  }

  return { ...config, user: userConfig };
}
