import * as compose from "docker-compose";
import { Service } from "docker-compose/dist/compose-spec";
import { Config } from "../../types";
import { execa } from "execa";
import { join } from "node:path";

export async function deployNginxDocker(config: Config) {
  const target = join(config.options.configDir, "nginx");
  const networName = config.docker.network;
  const constainerName = "worcable-reverse-proxy-nginx";

  await execa("mkdir", ["-p", "./conf.d"], { stdio: "inherit", cwd: target });
  await execa("mkdir", ["-p", "./certbot/www"], {
    stdio: "inherit",
    cwd: target,
  });
  await execa("mkdir", ["-p", "./certbot/conf"], {
    stdio: "inherit",
    cwd: target,
  });

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
    image: "certbot/certbot:latest",
    restart: "always",
    container_name: "worcable-reverse-proxy-certbot",
    environment: {},
    networks: [networName],
    volumes: [
      "./certbot/www:/var/www/certbot",
      "./certbot/conf:/etc/letsencrypt",
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
