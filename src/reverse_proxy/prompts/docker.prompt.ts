import { input } from "@inquirer/prompts";
import { ConfigManager } from "../../services/config.service";
import pc from "picocolors";
import { logger } from "../../services/logger.service";
import { Config } from "../types";

export type DockerConfig = {
  network: string;
  nginxContainerName: string;
  port: number;
};

export async function askDocker(config: Config) {
  const configManager = new ConfigManager<DockerConfig>(
    ".worcable-reverse-proxy",
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

    let port = dockerConfig?.port ?? 4800;
    const usePort = await input({
      message: `Port`,
      default: port?.toString(),
      validate: async (value) => {
        const num = Number(value);
        if (isNaN(num) || num < 1 || num > 65535) {
          return "Port must be a number between 1 and 65535";
        }

        return true;
      },
    });

    port = Number(usePort);

    return { network, port } as DockerConfig;
  }

  config.docker = dockerConfig;
  return config;
}
