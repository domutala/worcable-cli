import { cac } from "cac";
import { installCommand } from "./commands/install";

const cli = cac("worcable");

cli
  .command("install", "Install Worcable")
  .option("--lisener", "Update on branch change")
  .action(installCommand);

cli.help();
cli.parse();
