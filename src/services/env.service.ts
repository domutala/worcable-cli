import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import * as z from "zod";

/**
 * Reads a .env file and returns a key-value object
 * @param filePath Path to the .env file (relative or absolute)
 */
export function loadEnv(filePath: string): Record<string, string> {
  const fullPath = join(filePath);

  if (!existsSync(fullPath)) return {};

  // Read file content with UTF-8 encoding
  const content = readFileSync(fullPath, "utf-8");
  const config: Record<string, string> = {};

  // Split content by lines (handles both \n and \r\n)
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    // 1. Remove surrounding whitespace
    const trimmedLine = line.trim();

    // 2. Ignore empty lines and comments starting with '#'
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    // 3. Find the first "=" to split key and value
    const [key, ...valueParts] = trimmedLine.split("=");

    if (key) {
      const trimmedKey = key.trim();

      // Rejoin value parts in case the value contains "=" signs
      let rawValue = valueParts.join("=").trim();

      // 4. Remove surrounding quotes (e.g., "value" -> value or 'value' -> value)
      rawValue = rawValue.replace(/^['"]|['"]$/g, "");

      config[trimmedKey] = rawValue;
    }
  }

  return config;
}

/**
 * Validates and parses the environment variables using a Zod schema
 * @param rawEnv The raw record from your load() function
 * @param schema The Zod object schema
 */
export function validateEnv<T extends z.ZodRawShape>(
  rawEnv: Record<string, string>,
  schema: z.ZodObject<T>
) {
  // .safeParse allows us to handle errors manually for a cleaner output
  const result = schema.safeParse(rawEnv);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    process.exit(1); // Stop the app if config is invalid
  }

  return result.data;
}

/**
 * Saves a key-value object to a .env file
 * @param data The object containing environment variables
 * @param filePath Path to the .env file
 */
export function saveEnv(data: Record<string, any>, filePath: string): void {
  const dir = dirname(filePath);

  // 1. Ensure the directory exists
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  // 2. Convert object to .env format (KEY=VALUE)
  const content = Object.entries(data)
    .map(([key, value]) => {
      let formattedValue = value;

      // // Handle special types (Objects/Arrays) by converting back to JSON
      // if (typeof value === "object" && value !== null) {
      //   formattedValue = JSON.stringify(value);
      // }

      if (typeof formattedValue === "string") {
        return `${key}="${formattedValue}"`;
      }

      return `${key}=${value}`;
    })
    .join("\n");

  // 3. Write file to disk
  writeFileSync(filePath, content, "utf-8");
}
