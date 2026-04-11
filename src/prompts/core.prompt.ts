import { input } from "@inquirer/prompts";
import { join } from "path";
import { Config } from "../types";
import * as z from "zod";
import { loadEnv, saveEnv, validateEnv } from "../services/env.service";
import { isPortAvailable } from "../utils/is_post_used";
import { randomBytes } from "crypto";
import { logger } from "../services/logger.service";
import { existsSync, mkdirSync } from "fs";

const envSchema = z.object({
  PORT: z.string().transform(Number).pipe(z.number().positive()).optional(),
  NUXT_PUBLIC_APP_URL: z.url().optional(),
  NUXT_DATABASE_URL: z.url().optional(),
  NUXT_SECRET_KEY: z.string().optional(),
});

export interface CoreConfig {
  baseDir: string;
  appUrl: string;
  port: number;
  env: z.infer<typeof envSchema>;
}

export async function askCoreConfig(config: Config): Promise<Config> {
  logger.log(
    [
      ">",
      logger.accent({ color: "bgMagenta", val: "core" }).val,
      "Configuration",
    ].join(" ")
  );

  const baseDir = join(config.user.configDir, config.user.deployMethod, "core");
  if (!existsSync(baseDir)) mkdirSync(baseDir, { recursive: true });

  const env = validateEnv(loadEnv(join(baseDir, ".env")), envSchema);

  let port = env.PORT ?? (await getDefaultPort());
  const usePort = await input({
    message: `Port`,
    default: port?.toString(),
    validate: async (value) => {
      const num = Number(value);
      if (isNaN(num) || num < 1 || num > 65535) {
        return "Port must be a number between 1 and 65535";
      }

      return true;
    },
  });

  port = Number(usePort);

  let appUrl = env.NUXT_PUBLIC_APP_URL;
  if (config.user.baseUrl === "localhost") {
    appUrl = `${config.user.protocole}://localhost:${port}`;
  } else {
    if (!appUrl) {
      if (config.version === "latest") {
        appUrl = `${config.user.protocole}://${config.user.baseUrl}`;
      } else {
        const v = config.version.replaceAll(".", "");
        appUrl = `${config.user.protocole}://${v}.${config.user.baseUrl}`;
      }
    }

    appUrl = await input({
      message: `Core base url (example: https://career.your-domain.com)`,
      default: appUrl,
      validate(value) {
        const result = z.url().safeParse(value);
        if (!result.success) {
          return "Please enter a valid URL (including http:// or https://)";
        }

        if (!value.startsWith(config.user.protocole)) {
          return `URL must use the configured protocol: ${config.user.protocole}`;
        }

        return true;
      },
    });
  }

  let secretKey = env.NUXT_SECRET_KEY;
  secretKey = await input({
    message: "Application secret key (leave empty to auto-generate)",
    validate(value) {
      if (!z.string().min(12).optional().safeParse(value)) {
        return "Secret key is too short (at least 32 characters required for security)";
      }

      return true;
    },
  });

  secretKey ||= randomBytes(32).toString("hex");

  let databaseUrl = config.services.database.env.DATABASE_URL;
  databaseUrl ||= env.NUXT_DATABASE_URL;
  databaseUrl = await input({
    message: "Database URL",
    default: databaseUrl,
    validate(value) {
      if (!z.url().safeParse(value)) {
        return "Database URL is not valid";
      }

      return true;
    },
  });

  env.PORT = port;
  env.NUXT_PUBLIC_APP_URL = appUrl;
  env.NUXT_SECRET_KEY = secretKey;
  env.NUXT_DATABASE_URL = databaseUrl;

  saveEnv(env, join(baseDir, ".env"));
  config.services.core = {
    baseDir,
    appUrl,
    port,
    env,
  };

  async function getDefaultPort() {
    let port: number;

    if (config.version === "latest") port = 4730;
    if (config.version === "dev") port = 4731;
    else port = 4732;

    // const isUded = await isPortAvailable(port)

    return port;
  }

  return config;
}
