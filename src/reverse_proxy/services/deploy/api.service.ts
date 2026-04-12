import { join } from "node:path";
import { execa } from "execa";
import { Config } from "../../types";
import { Service } from "docker-compose/dist/compose-spec";
import { copy, outputFile, existsSync } from "fs-extra";
import * as compose from "docker-compose";

const SERVICE_RAW = `[Unit]
Description=Worcable GitHub Listener Service
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/node dist/index.cjs
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=$PORT

# Logs
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
`;

export async function deployDaemon(config: Config) {
  const target = join(config.options.configDir, "api");
  const serviceName = `worcable.reverse.proxy.api.service`;
  const port = config.docker.port;

  await clone(target);

  const service = SERVICE_RAW.replaceAll("$PROJECT_DIR", target).replaceAll(
    "$PORT",
    port.toString()
  );

  await execa("sudo", ["pnpm", "install", "--frozen-lockfile"], {
    cwd: target,
    stdio: "inherit",
  });

  await execa("sudo", ["pnpm", "build"], { cwd: target, stdio: "inherit" });

  await copy(
    join(target, "src/nginx/templates"),
    join(target, "dist/templates")
  );

  await outputFile(`/etc/systemd/system/${serviceName}`, service, "utf-8");

  await execa("sudo", ["systemctl", "daemon-reload"], { stdio: "inherit" });

  await execa("sudo", ["systemctl", "enable", serviceName], {
    stdio: "inherit",
  });

  await execa("sudo", ["systemctl", "start", serviceName], {
    stdio: "inherit",
  });
}

export async function deployDocker(config: Config) {
  const target = join(config.options.configDir, "api");
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
    volumes: ["/var/run/docker.sock:/var/run/docker.sock"],
  };

  const labels: string[] = [];
  service.labels = labels;
  service.networks = [networName];

  await clone(target);

  const r = await compose.upAll({
    log: true,
    cwd: target,
    commandOptions: ["--build", "--force-recreate"],
    compose: {
      services: { reverseproxy: service },
      networks: {
        [networName]: { external: true },
      },
    },
  });

  return r;
}

async function clone(target: string) {
  if (existsSync(target)) {
    await execa("git", ["reset", "--hard", "HEAD"], {
      stdio: "inherit",
      cwd: target,
    });

    await execa("git", ["pull"], { stdio: "inherit", cwd: target });
  } else {
    await execa(
      "git",
      [
        "clone",
        "https://github.com/domutala/worcable-reverse-proxy.git",
        target,
      ],
      { stdio: "inherit" }
    );
  }
}
