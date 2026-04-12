import { execSync } from "node:child_process";

export function ensureNetworkExists(networkName: string) {
  try {
    execSync(`docker network inspect ${networkName}`, {
      stdio: "ignore",
    });
  } catch {
    execSync(`docker network create ${networkName}`, {
      stdio: "inherit",
    });
  }
}
