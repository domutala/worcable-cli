import { askDocker } from "../reverse_proxy/prompts/docker.prompt";
import { askOptions } from "../reverse_proxy/prompts/options.prompt";
import { deploy } from "../reverse_proxy/services/deploy/index.service";
import { logger } from "../services/logger.service";
import { ReverseProxyConfig } from "../reverse_proxy/types";
import { DeployMethod } from "../types";

export type ReverseProxyPrams = {
  docker?: { forceNetwork?: string };
  forceDeployMethod?: DeployMethod;
  forceUrl?: string;
  forceAdminEmail?: string;
};

export async function reverseProxyCommand(params: ReverseProxyPrams = {}) {
  // logger.title("🚀 Worcable reverse proxy").log();

  let config = { params } as any as ReverseProxyConfig;

  config = await askOptions(config);
  config = await askDocker(config);

  await deploy(config);
}
