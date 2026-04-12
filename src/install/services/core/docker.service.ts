import * as compose from "docker-compose";
import type { Service } from "docker-compose/dist/compose-spec";
import type { IntallConfig } from "../../types";

export async function runDocker(config: IntallConfig) {
  const containerName = config.services.core.containerName;
  const networName = config.docker.network;
  const port = config.services.core.port;

  const service: Service = {
    image: `domutala/worcable-core:${config.version}`,
    container_name: containerName,
    restart: "always",
    env_file: ".env",
    environment: { NODE_ENV: "production" },
    ports: [`${port}:${port}`],
    logging: {
      driver: "json-file",
      options: {
        "max-size": "10m",
        "max-file": "3",
      },
    },
  };

  const labels: string[] = [];
  service.labels = labels;
  service.networks = [networName];

  const r = await compose.upAll({
    log: true,
    cwd: config.services.core.baseDir,
    compose: {
      services: { core: service },
      networks: {
        [networName]: { external: true },
      },
    },
  });

  return r;
}
