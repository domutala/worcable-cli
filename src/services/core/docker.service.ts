import * as compose from "docker-compose";
import type { Service } from "docker-compose/dist/compose-spec";
import type { Config } from "../../types";

export async function runDocker(config: Config) {
  const tag = config.version.replaceAll(".", "").replaceAll("/", "-");
  const containerName = `worcable-core-${tag}`;
  const domain = config.services.core.appUrl.replace(/^https?:\/\//, "");
  const networName = config.user.dockerNetwork;

  const service: Service = {
    image: `domutala/worcable-core:${config.version}`,
    container_name: containerName,
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
      `traefik.enable=true`,
      `traefik.http.routers.worcable-${containerName}.rule=Host('${domain}')`,
      `traefik.http.routers.worcable-${containerName}.entrypoints=web,websecure`,
      `traefik.http.routers.worcable-${containerName}.tls.certresolver=myresolver`,
      `traefik.http.services.worcable-${containerName}.loadbalancer.server.port=80`,
      `traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https`,
      `traefik.http.routers.worcable-${containerName}.middlewares=redirect-to-https`

      // "traefik.enable=true",
      // `traefik.http.routers.worcable-${containerName}.rule=Host('${domain}')`,
      // `traefik.http.routers.worcable-${containerName}.entrypoints=web,websecure`,
      // `traefik.http.routers.worcable-${containerName}.tls.certresolver=myresolver`,
      // `traefik.http.services.worcable-${containerName}.loadbalancer.server.port=${80}`,
      // `traefik.http.routers.worcable-${containerName}-http.rule=Host('${domain}')`,
      // `traefik.http.routers.worcable-${containerName}-http.entrypoints=web`,
      // `traefik.http.routers.worcable-${containerName}-http.middlewares=redirect-to-http`,
      // `traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https`
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
