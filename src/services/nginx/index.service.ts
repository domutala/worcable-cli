// src/nginx.ts
import fs from "fs-extra";
import Handlebars from "handlebars";
import { join } from "node:path";

export async function writeHttpConfig(config: any) {
  const tplPath = join(__dirname, "templates/nginx.http.conf.hbs");
  const tpl = await fs.readFile(tplPath, "utf-8");
  const compiled = Handlebars.compile(tpl);

  const output = compiled(config);
  await fs.outputFile(`/etc/nginx/conf.d/${config.domain}.conf`, output);
}
