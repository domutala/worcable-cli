// src/index.ts
import { writeHttpConfig } from "./index.service";
import { generateCertificate } from "./certbot";
import { reloadNginx } from "./docker";

export async function setupSSL() {
  const config = {
    domain: "app.worcable.space",
    containerPort: 3000,
    serviceName: "my_app",
    email: "admin@gmail.com",
  };

  console.log("🧱 Writing Nginx HTTP config...");
  await writeHttpConfig(config);

  console.log("♻️ Reloading Nginx...");
  await reloadNginx();

  console.log("🔐 Generating SSL...");
  await generateCertificate(config.domain, config.email);

  console.log("♻️ Reloading Nginx (final)...");
  await reloadNginx();

  console.log("✅ SSL setup completed");
}

setupSSL().catch(console.error);
