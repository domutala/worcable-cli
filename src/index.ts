import { cac } from "cac";
import { installCommand } from "./commands/install";
import { reverseProxyCommand } from "./commands/reverse_proxy";

const cli = cac("worcable");

cli.command("install", "Install Worcable").action(installCommand);
cli.command("reverse-proxy", "Reverse prpoxy").action(reverseProxyCommand);

cli.help();
cli.parse();
