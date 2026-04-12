import * as compose from "docker-compose";
import type { Service } from "docker-compose/dist/compose-spec";
import type { Config } from "../../types";

export async function runDocker(config: Config) {
  const tag = config.version.replaceAll(".", "").replaceAll("/", "-");
  const branchName = `worcable-database-${tag}`;
  const networName = config.docker.network;

  const service: Service = {
    image: "mongo:latest",
    container_name: branchName,
    restart: "always",
    env_file: ".env",
    environment: { NODE_ENV: "production" },
    ports: [`${config.services.database.port}:27017`],
    logging: {
      driver: "json-file",
      options: {
        "max-size": "10m",
        "max-file": "3",
      },
    },
    volumes: [`mongo-data-${tag}:/data/db`],
  };

  service.networks = [networName];

  const r = await compose.upAll({
    log: true,
    cwd: config.services.database.baseDir,
    compose: {
      services: { database: service },

      volumes: { [`mongo-data-${tag}`]: {} },

      networks: {
        [networName]: { external: true },
      },
    },
  });

  return r;
}
