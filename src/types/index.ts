import type { CoreConfig } from "../prompts/core.prompt";
import { DatabaseConfig } from "../prompts/database.prompt";

export type ServiceName = "core" | "db" | "mailer" | "cvparser";

export interface UserConfig {
  name: string;
  email: string;
  orgName: string;

  baseUrl: string;
  protocole: string;

  deployMethod: "docker" | "native";
  dockerNetwork: string;
  reverseProxy: "none" | "traefik" | "nginx";

  configDir: string;
  configPath: string;
}

export type Config = {
  user: UserConfig;
  version: string;
  services: {
    availables: ServiceName[];
    core: CoreConfig;
    database: DatabaseConfig;
  };
};

export interface SslConfig {
  domain: string;
  containerPort: number;
  serviceName: string;
  email: string;
}
