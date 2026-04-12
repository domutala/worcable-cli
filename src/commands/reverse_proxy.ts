import { askDocker } from "../reverse_proxy/prompts/docker.prompt";
import { askOptions } from "../reverse_proxy/prompts/options.prompt";
import { deploy } from "../reverse_proxy/services/deploy/index.service";
import { logger } from "../services/logger.service";
import { ReverseProxyConfig } from "../reverse_proxy/types";

export async function reverseProxyCommand(options: { resetConfig?: boolean }) {
  logger.title("🚀 Worcable installer").log();

  let config = {} as any as ReverseProxyConfig;

  config = await askOptions(config);
  config = await askDocker(config);

  deploy(config);
}
