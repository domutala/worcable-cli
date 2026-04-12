import { Config } from "../../types";
import { logger } from "../../../services/logger.service";
import { deployDaemon } from "./api.service";
import { deployNginxDocker } from "./nginx.docker.service";
import { ensureNetworkExists } from "../docker/ensure_network_exists";

export async function deploy(config: Config) {
  logger.accent("Deployment").log();

  if (config.options.deployMethod === "docker") {
    ensureNetworkExists(config.docker.network);

    await deployNginxDocker(config);
    await deployDaemon(config);
  }
}
