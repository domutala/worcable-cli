import { checkbox } from "@inquirer/prompts";
import { Config, ServiceName } from "../types";
import { logger } from "../../services/logger.service";

export async function askServices(config: Config): Promise<Config> {
  const selected = await checkbox({
    message: logger.step(`services`, "Select Worcable services to install").val,
    choices: [
      {
        name: "1. Core",
        value: "core",
        checked: true,
        disabled: "(required)",
      },
      {
        name: "2. Database",
        value: "db",
        checked: true,
      },
      {
        name: "3. Mailer",
        value: "mailer",
        disabled: "(coming soon)",
      },
      {
        name: "4. CV Parser",
        value: "cvparser",
        disabled: "(coming soon)",
      },
    ],
  });

  // Sécurité : on force core au cas où
  if (!selected.includes("core")) selected.push("core");

  config.services ??= {} as any;
  config.services.availables = selected as ServiceName[];

  return config;
}
