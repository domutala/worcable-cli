import { execa } from "execa";

export async function generateCertificate(domain: string, email: string) {
  await execa(
    "docker",
    [
      "compose",
      "run",
      "--rm",
      "certbot",
      "certonly",
      "--webroot",
      "--webroot-path=/var/www/certbot",
      "-d",
      domain,
      "--email",
      email,
      "--agree-tos",
      "--no-eff-email",
    ],
    {
      stdio: "inherit",
    }
  );
}
