import pkg from '../package.json' with { type: 'json' };
import { cac } from "cac";
import { installCommand } from "./commands/install";
import { reverseProxyCommand } from "./commands/reverse_proxy";
import { pico } from './utils/pico';

const cli = cac("worcable");

cli
  .command("install", "Install Worcable on the system")
  .alias("i")
  .action(installCommand);

cli
  .command("reverse-proxy", "Start Worcable reverse proxy")
  .alias("rp")
  .action(reverseProxyCommand);

  cli.version(pkg.version);
cli.help();
cli.parse();

process.on("uncaughtException", (error) => {
  if (error.name === "ExitPromptError") {
    pico.clear().render('red', '🗙').text("shut down").log();
    process.exit(0);
  }

  console.error(error);
  process.exit(1);
});

