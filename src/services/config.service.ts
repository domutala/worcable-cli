import fs from "node:fs";
import path from "node:path";
import os from "os";
import { logger } from "./logger.service";

export class ConfigManager<T> {
  private readonly configDir: string;
  private readonly configPath: string;

  constructor(dir: string, file: string) {
    this.configDir = path.join(os.homedir(), dir);
    this.configPath = path.join(this.configDir, file);
  }

  /**
   * Vérifie si le fichier de configuration existe.
   */
  public exists(): boolean {
    return fs.existsSync(this.configPath);
  }

  /**
   * Lit la configuration depuis le disque.
   * Retourne null si le fichier n'existe pas ou est corrompu.
   */
  public read(): T | null {
    if (!this.exists()) return null;

    try {
      const raw = fs.readFileSync(this.configPath, "utf-8");
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error("Erreur lors de la lecture du fichier config:", error);
      return null;
    }
  }

  /**
   * Sauvegarde la configuration sur le disque.
   * Crée le dossier parent s'il n'existe pas.
   */
  public save(config: T): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }

    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    logger.success(`Saved at: ${this.configPath}`).log();
  }

  /**
   * Retourne le chemin absolu du fichier de configuration.
   */
  public getPath(): string {
    return this.configPath;
  }

  public getDir(): string {
    return this.configDir;
  }
}
