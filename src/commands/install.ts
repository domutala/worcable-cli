import { askCoreConfig } from "../prompts/core.prompt";
import { askDatabase } from "../prompts/database.prompt";
import { askDocker } from "../prompts/docker.prompt";
import { askServices } from "../prompts/services.prompt";
import { askUserInfo } from "../prompts/user.prompt";
import { askVersion } from "../prompts/version.prompt";
import { runDaemon } from "../services/daemon.service";
import { deploy } from "../services/deploy.service";
import { logger } from "../services/logger.service";
import { Config } from "../types";

export async function installCommand(options: { resetConfig?: boolean }) {
  logger.title("🚀 Worcable installer").log();

  let config = { services: {} } as any as Config;

  config.version = await askVersion();

  config = await askUserInfo(config);
  config = await askDocker(config);
  config = await askServices(config);
  config = await askDatabase(config);
  config = await askCoreConfig(config);

  // await deploy(config);
  // await runDaemon(config);
}
