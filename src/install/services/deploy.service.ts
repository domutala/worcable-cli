import { Config } from "../types";
import { deployCore } from "./core";
import { deployDatabase } from "./database";
import { ensureNetworkExists } from "./docker/ensure_network_exists";
import { logger } from "../../services/logger.service";

export async function deploy(config: Config) {
  if (config.user.deployMethod === "docker") {
    ensureNetworkExists(config.docker.network);
  }

  logger.log(
    [
      ">",
      logger.accent({ color: "bgMagenta", val: "database" }).val,
      "Deployment",
    ].join(" ")
  );
  await deployDatabase(config);

  logger.log(
    [
      ">",
      logger.accent({ color: "bgMagenta", val: "core" }).val,
      "Deployment",
    ].join(" ")
  );
  await deployCore(config);
}
