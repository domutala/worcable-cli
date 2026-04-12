import type { DockerConfig } from "../prompts/docker.prompt";
import { Options } from "../prompts/options.prompt";

export type DeployMethod = "docker" | "native";

export type Config = {
  options: Options;
  docker: DockerConfig;
};
