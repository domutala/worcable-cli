import { confirm } from "@inquirer/prompts";
import { ConfigManager } from "../../services/config.service";
import { IntallConfig } from "../types";
import { reverseProxyCommand } from "../../commands/reverse_proxy";
import { pico } from "../../utils/pico";

export type RPConfig = { use: boolean; url: string };

export async function askReverseProxy(
  config: IntallConfig
): Promise<IntallConfig> {
  const configManager = new ConfigManager<RPConfig>(
    ".worcable",
    "reverse-proxy.json"
  );
  let rpConfig = configManager.read();

  rpConfig = await ask();

  configManager.save(rpConfig);

  async function ask() {
    pico.clear().render("green", "⮞").render("magenta", "Reverse proxy").log();

    const use = await confirm({
      message: "Use Worcable reverse proxy",
      default: rpConfig?.use ?? false,
    });
    let url = rpConfig?.url;

    if (use) {
      await reverseProxyCommand({
        forceDeployMethod: config.user?.deployMethod,
        forceAdminEmail: config.user?.email,
        docker: { forceNetwork: config.docker?.network },
      });
    }

    return {
      use,
      url,
    } as RPConfig;
  }

  return { ...config, reverseProxy: rpConfig };
}
