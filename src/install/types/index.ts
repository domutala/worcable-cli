import { DeployMethod, ServiceName } from "../../types";
import type { CoreConfig } from "../prompts/core.prompt";
import type { DatabaseConfig } from "../prompts/database.prompt";
import type { DockerConfig } from "../prompts/docker.prompt";

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
  services: {
    availables: ServiceName[];
    core: CoreConfig;
    database: DatabaseConfig;
  };
};
