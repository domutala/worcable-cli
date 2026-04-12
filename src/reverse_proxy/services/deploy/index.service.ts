import { ReverseProxyConfig } from "../../types";
import { logger } from "../../../services/logger.service";
import { deployDaemon } from "./api.service";
import { deployNginxDocker } from "./nginx.docker.service";
import { ensureNetworkExists } from "../../../services/docker/ensure_network_exists";

export async function deploy(config: ReverseProxyConfig) {
  logger.accent("Deployment").log();

  if (config.options.deployMethod === "docker") {
    ensureNetworkExists(config.docker.network);
    await deployNginxDocker(config);
  }

  await deployDaemon(config);
}
