import { input, password } from "@inquirer/prompts";
import { IntallConfig } from "../types";
import * as z from "zod";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { loadEnv, saveEnv, validateEnv } from "../../services/env.service";
import { randomBytes } from "node:crypto";
import { pico } from "../../utils/pico";

const databaseEnvSchema = z.object({
  PORT: z.string().transform(Number).pipe(z.number().positive()).optional(),
  DATABASE_URL: z.string().optional(),
  MONGO_INITDB_ROOT_USERNAME: z.string().min(3).optional(),
  MONGO_INITDB_ROOT_PASSWORD: z.string().min(8).optional(),
});

export interface DatabaseConfig {
  baseDir: string;
  port: number;
  containerName: string;
  env: z.infer<typeof databaseEnvSchema>;
}

function validateWith(schema: z.ZodTypeAny, errorMsg: string) {
  return (value: string) => {
    const result = schema.safeParse(value);
    return result.success || errorMsg;
  };
}

export async function askDatabase(config: IntallConfig) {
  pico
    .clear()
    .render("green", "⮞")
    .render("magenta", "Database Configuration")
    .log();

  const baseDir = join(
    config.user.configDir,
    config.user.deployMethod,
    "database"
  );
  if (!existsSync(baseDir)) mkdirSync(baseDir, { recursive: true });

  const env = validateEnv(loadEnv(join(baseDir, ".env")), databaseEnvSchema);
  const tag = config.version.replaceAll(".", "").replaceAll("/", "-");
  const containerName = `worcable-database-${tag}`;

  let dbURL = env.DATABASE_URL;
  let dbUsername = env.MONGO_INITDB_ROOT_USERNAME;
  let dbPassword = env.MONGO_INITDB_ROOT_PASSWORD;
  let port = env.PORT ?? (await getDefaultPort());

  if (config.services.availables.includes("db")) {
    if (!dbUsername) dbUsername = "admin";

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

    dbUsername = await input({
      message: "Mongo root username",
      default: dbUsername,
      validate: validateWith(
        z.string().min(3),
        "Username must be at least 3 characters"
      ),
    });

    dbPassword = await password({
      message: "Mongo root password (leave empty to auto-generate)",
      validate: validateWith(
        z.string().optional(),
        "Password must be at least 8 characters"
      ),
    });

    if (!dbPassword) dbPassword = randomBytes(16).toString("hex");

    dbURL = `mongodb://${dbUsername}:${dbPassword}@${containerName}:27017/worcable?authSource=admin`;
    // dbURL = `mongodb://${dbUsername}:${dbPassword}@localhost:${port}/worcable?authSource=admin`;
  } else {
    dbURL = await input({
      message: "Mongo Database URL",
      default: dbURL,
      validate: validateWith(z.url(), "Database URL is not valid"),
    });
  }

  env.PORT = port;
  env.DATABASE_URL = dbURL;
  env.MONGO_INITDB_ROOT_USERNAME = dbUsername;
  env.MONGO_INITDB_ROOT_PASSWORD = dbPassword;

  saveEnv(env, join(baseDir, ".env"));
  config.services.database = {
    baseDir,
    port,
    containerName,
    env,
  };

  async function getDefaultPort() {
    let port: number;

    if (config.version === "latest") port = 4720;
    if (config.version === "dev") port = 4721;
    else port = 4722;

    return port;
  }

  return config;
}
