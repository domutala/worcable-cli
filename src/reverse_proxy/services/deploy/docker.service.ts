import * as compose from "docker-compose";
import { Service } from "docker-compose/dist/compose-spec";
import { Config } from "../../types";
import { execa } from "execa";
import { join } from "node:path";
import { existsSync } from "node:fs";

export async function deployDocker(config: Config) {
  const networName = config.docker.network;
  const port = config.docker.port;
  const constainerName = "worcable-reverse-proxy-api";

  const service: Service = {
    build: { context: ".", dockerfile: "Dockerfile" },
    restart: "always",
    env_file: ".env",
    container_name: constainerName,
    environment: {
      NODE_ENV: "production",
      ADMIN_EMAIL: config.options.adminEmail,
      PORT: port,
    },
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

  const gitTarget = join(config.options.configDir, "api");

  if (existsSync(gitTarget)) {
    await execa("git", ["reset", "--hard", "HEAD"], {
      stdio: "inherit",
      cwd: gitTarget,
    });

    await execa("git", ["pull"], { stdio: "inherit", cwd: gitTarget });
  } else {
    await execa(
      "git",
      [
        "clone",
        "https://github.com/domutala/worcable-reverse-proxy.git",
        join(config.options.configDir, "api"),
      ],
      { stdio: "inherit" }
    );
  }

  const r = await compose.upAll({
    log: true,
    cwd: gitTarget,
    compose: {
      services: { reverseproxy: service },
      networks: {
        [networName]: { external: true },
      },
    },
  });

  return r;
}
