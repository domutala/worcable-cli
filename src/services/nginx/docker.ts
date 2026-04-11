// src/docker.ts
import { execa } from "execa";

export async function reloadNginx() {
  await execa("docker", ["exec", "nginx_server", "nginx", "-s", "reload"], {
    stdio: "inherit",
  });
}
