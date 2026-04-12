import { DeployMethod, ServiceName } from "../../types";
import type { CoreConfig } from "../prompts/core.prompt";
import type { DatabaseConfig } from "../prompts/database.prompt";
import type { DockerConfig } from "../prompts/docker.prompt";
import type { RPConfig } from "../prompts/reverse_proxy.prompt";

export interface UserConfig {
  name: string;
  email: string;
  orgName: string;

  baseUrl: string;
  protocole: string;

  deployMethod: DeployMethod;

  configDir: string;
  configPath: string;
}

export type IntallConfig = {
  user: UserConfig;
  version: string;
  docker: DockerConfig;
  reverseProxy: RPConfig;
  services: {
    availables: ServiceName[];
    core: CoreConfig;
    database: DatabaseConfig;
  };
};
