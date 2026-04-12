import type { DockerConfig } from "../prompts/docker.prompt";
import type { Options } from "../prompts/options.prompt";

export type ReverseProxyConfig = {
  options: Options;
  docker: DockerConfig;
};
