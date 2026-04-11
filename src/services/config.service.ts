import fs from "fs";
import path from "path";
import os from "os";
import { UserConfig } from "../types";

export class ConfigManager {
  private readonly version: string;
  private readonly configDir: string;
  private readonly configPath: string;

  constructor(options: { version: string }) {
    this.version = options.version;
    this.configDir = path.join(os.homedir(), ".worcable", this.version);
    this.configPath = path.join(this.configDir, "config.json");
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
  public read(): UserConfig | null {
    if (!this.exists()) return null;

    try {
      const raw = fs.readFileSync(this.configPath, "utf-8");
      return JSON.parse(raw) as UserConfig;
    } catch (error) {
      console.error("Erreur lors de la lecture du fichier config:", error);
      return null;
    }
  }

  /**
   * Sauvegarde la configuration sur le disque.
   * Crée le dossier parent s'il n'existe pas.
   */
  public save(config: UserConfig): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }

    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
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
