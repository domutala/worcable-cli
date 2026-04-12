import * as compose from "docker-compose";
import { Service } from "docker-compose/dist/compose-spec";
import { Config } from "../../types";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

export async function deployNginxDocker(config: Config) {
  const target = join(config.options.configDir, "nginx");
  const networName = config.docker.network;
  const constainerName = "worcable-reverse-proxy-nginx";

  mkdirSync(join(target, "conf.d"), { recursive: true });
  mkdirSync(join(target, "certbot/www"), { recursive: true });
  mkdirSync(join(target, "certbot/conf"), { recursive: true });

  const nginxService: Service = {
    image: "nginx:latest",
    restart: "always",
    container_name: constainerName,
    environment: {},
    networks: [networName],
    ports: ["80:80", "443:443", "8080:8080"],
    volumes: [
      "./conf.d:/etc/nginx/conf.d",
      "./certbot/www:/var/www/certbot",
      "./certbot/conf:/etc/letsencrypt",
    ],
  };

  const certbotService: Service = {
    image: "python:3.12-slim", // "certbot/certbot:latest",
    restart: "always",
    container_name: "worcable-reverse-proxy-certbot",
    environment: {},
    networks: [networName],
    volumes: [
      "./certbot/www:/var/www/certbot",
      "./certbot/conf:/etc/letsencrypt",
    ],
    command: [
      `sh -c "
      pip install --no-cache-dir certbot certbot-nginx &&
      echo 'Certbot ready' &&
      sleep infinity
      "`,
    ],
  };

  const r = await compose.upAll({
    log: true,
    cwd: target,
    compose: {
      services: { nginx: nginxService, cerbot: certbotService },
      networks: {
        [networName]: { external: true },
      },
    },
  });

  return r;
}
