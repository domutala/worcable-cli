import { join } from "node:path";
import { IntallConfig } from "../../types";
import { runDocker } from "./docker.service";
import { existsSync, mkdirSync } from "node:fs";

export async function deployCore(config: IntallConfig) {
  const baseDir = join(config.user.configDir, config.user.deployMethod, "core");
  if (!existsSync(baseDir)) mkdirSync(baseDir, { recursive: true });

  if (config.user.deployMethod === "docker") {
    await runDocker(config);
  } else if (config.user.deployMethod === "native") {
  }
}
