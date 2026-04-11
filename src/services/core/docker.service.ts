import Dockerode from "dockerode";
import * as compose from "docker-compose";
import type { Service } from "docker-compose/dist/compose-spec";
import type { Config } from "../../types";

export async function runDocker(config: Config) {
  const tag = config.version.replaceAll(".", "").replaceAll("/", "-");
  const branchName = `worcable-core-${tag}`;
  const domain = config.services.core.appUrl.replace(/^https?:\/\//, "");
  const networName = config.user.dockerNetwork;

  const service: Service = {
    image: `domutala/worcable-core:${config.version}`,
    container_name: branchName,
    restart: "always",
    env_file: ".env",
    environment: { NODE_ENV: "production" },
    ports: [`${config.services.core.port}:${config.services.core.port}`],
    logging: {
      driver: "json-file",
      options: {
        "max-size": "10m",
        "max-file": "3",
      },
    },
  };

  const labels: string[] = [];

  if (config.user.reverseProxy === "traefik") {
    labels.push(
      "traefik.enable=true",
      `traefik.http.routers.worcable-${branchName}.rule=Host('${domain}')`,
      `traefik.http.routers.worcable-${branchName}.entrypoints=web,websecure`,
      `traefik.http.routers.worcable-${branchName}.tls.certresolver=myresolver`,
      `traefik.http.services.worcable-${branchName}.loadbalancer.server.port=${config.services.core.port}`,
      `traefik.http.routers.worcable-${branchName}-http.rule=Host('${domain}')`,
      `traefik.http.routers.worcable-${branchName}-http.entrypoints=web`,
      `traefik.http.routers.worcable-${branchName}-http.middlewares=redirect-to-http`,
      `traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https`
    );
  }

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
