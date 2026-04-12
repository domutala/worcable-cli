import { input, select } from "@inquirer/prompts";
import { ConfigManager } from "../../services/config.service";
import * as z from "zod";
import pc from "picocolors";
import { logger } from "../../services/logger.service";
import { IntallConfig } from "../types";

export type DockerConfig = { network: string; nginxContainerName: string };

export async function askDocker(config: IntallConfig) {
  const configManager = new ConfigManager<DockerConfig>(
    ".worcable",
    "docker.json"
  );
  let dockerConfig = configManager.read();

  dockerConfig = await ask();
  configManager.save(dockerConfig);

  async function ask() {
    logger.step("config", `${pc.green("Docker")}`).log();

    const network = await input({
      message: "Docker newtwork",
      default: dockerConfig?.network ?? "proxy",
    });

    return { network } as DockerConfig;
  }

  config.docker = dockerConfig;
  return config;
}
