import { askCoreConfig } from "../install/prompts/core.prompt";
import { askDatabase } from "../install/prompts/database.prompt";
import { askDocker } from "../install/prompts/docker.prompt";
import { askServices } from "../install/prompts/services.prompt";
import { askUserInfo } from "../install/prompts/user.prompt";
import { askVersion } from "../install/prompts/version.prompt";
import { deploy } from "../install/services/deploy.service";
import { logger } from "../services/logger.service";
import { IntallConfig } from "../install/types";
import { askReverseProxy } from "../install/prompts/reverse_proxy.prompt";

export async function installCommand(options: { resetConfig?: boolean }) {
  logger.title("🚀 Worcable installer").log();

  let config = { services: {} } as any as IntallConfig;

  config = await askReverseProxy(config);
  config.version = await askVersion();
  config = await askUserInfo(config);
  config = await askDocker(config);
  config = await askServices(config);
  config = await askDatabase(config);
  config = await askCoreConfig(config);

  await deploy(config);
}
