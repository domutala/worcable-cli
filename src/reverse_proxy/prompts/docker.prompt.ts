import { input } from "@inquirer/prompts";
import { ConfigManager } from "../../services/config.service";
import { ReverseProxyConfig } from "../types";

export type DockerConfig = {
  network: string;
  nginxContainerName: string;
};
export async function askDocker(config: ReverseProxyConfig) {
  const configManager = new ConfigManager<DockerConfig>(
    ".worcable-reverse-proxy",
    "docker.json"
  );
  let dockerConfig = configManager.read();

  dockerConfig = await ask();
  configManager.save(dockerConfig);

  async function ask() {
    const network =
      config.params.docker?.forceNetwork ??
      (await input({
        message: "Docker newtwork",
        default: dockerConfig?.network ?? "proxy",
      }));

    return { network } as DockerConfig;
  }

  config.docker = dockerConfig;
  return config;
}
