import type { ReverseProxyPrams } from "../../commands/reverse_proxy";
import type { DockerConfig } from "../prompts/docker.prompt";
import type { Options } from "../prompts/options.prompt";

export type ReverseProxyConfig = {
  options: Options;
  docker: DockerConfig;
  params: ReverseProxyPrams;
};
