import { select } from "@inquirer/prompts";
import { logger } from "../services/logger.service";

interface GitTag {
  name: string;
}

const GITHUB_API = "https://api.github.com/repos/domutala/worcable/tags";

export async function askVersion(): Promise<string> {
  logger.step("version", "").log();

  let versions: string[] = [];
  const loader = logger.process("📦 Fetching available versions...");

  try {
    const res = await fetch(GITHUB_API);
    const data: GitTag[] = (await res.json()) as any;

    versions = data
      .map((tag) => tag.name)
      .filter((tag) => !["main", "develop", "cli"].includes(tag));

    loader.stop();
  } catch (err) {
    loader.error("Failed to fetch versions, fallback to defaults");
    throw "Failed to fetch versions, fallback to defaults";
  }

  // Ajouter les versions spéciales
  const choices = [
    { name: "Latest (stable)", value: "latest" },
    { name: "Development", value: "develop" },
    ...versions.map((v) => ({
      name: v,
      value: v,
    })),
  ];

  const selected = await select({
    message: "Select Worcable version to install",
    choices,
  });

  return selected;
}
