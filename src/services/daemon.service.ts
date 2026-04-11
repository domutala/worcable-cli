import { join } from "node:path";
import { Config } from "../types";
import { execa } from "execa";
import { writeFileSync } from "node:fs";

const SERVICE_RAW = `[Unit]
Description=Worcable GitHub Listener Service
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

# Logs
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
`;

export async function runDaemon(config: Config) {
  const projectDIR = join(config.user.configDir, "listener");
  const tag = config.version.replaceAll(".", "").replaceAll("/", "-");
  const serviceName = `worcable.listener.${tag}.service`;

  const source = join(process.cwd(), "..", "listener");
  await execa("rsync", ["-a", source, config.user.configDir]);

  const service = SERVICE_RAW.replaceAll("$PROJECT_DIR", projectDIR);
  await execa("pnpm", ["install"], {
    cwd: projectDIR,
    stdio: "inherit",
  });

  await execa("pnpm", ["build"], {
    cwd: projectDIR,
    stdio: "inherit",
  });

  const tmpPath = join("/tmp", serviceName);
  writeFileSync(tmpPath, service, "utf-8");

  await execa("sudo", ["mv", tmpPath, `/etc/systemd/system/${serviceName}`], {
    stdio: "inherit",
  });

  await execa("sudo", ["systemctl", "daemon-reload"], { stdio: "inherit" });

  await execa("sudo", ["systemctl", "enable", serviceName], {
    stdio: "inherit",
  });

  await execa("sudo", ["systemctl", "start", serviceName], {
    stdio: "inherit",
  });
}
