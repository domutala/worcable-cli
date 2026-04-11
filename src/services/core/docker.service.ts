import * as compose from "docker-compose";
import type { Service } from "docker-compose/dist/compose-spec";
import type { Config } from "../../types";

export async function runDocker(config: Config) {
  const tag = config.version.replaceAll(".", "").replaceAll("/", "-");
  const containerName = `worcable-core-${tag}`;
  const domain = config.services.core.appUrl.replace(/^https?:\/\//, "");
  const networName = config.user.dockerNetwork;
  const port = config.services.core.port;

  const service: Service = {
    image: `domutala/worcable-core:${config.version}`,
    container_name: containerName,
    restart: "always",
    env_file: ".env",
    environment: { NODE_ENV: "production" },
    logging: {
      driver: "json-file",
      options: {
        "max-size": "10m",
        "max-file": "3",
      },
    },
  };

  const labels: string[] = [];

  if (config.user.reverseProxy === "traefik") {
    service.ports = undefined;

    service.healthcheck = {
      test: ["CMD-SHELL", `wget -qO- http://localhost:${port} || exit 1`],
      interval: "30s",
      timeout: "5s",
      retries: 3,
    };

    labels.push(
      "traefik.enable=true",

      // 🌐 HTTPS router
      `traefik.http.routers.${containerName}.rule=Host(\`${domain}\`)`,
      `traefik.http.routers.${containerName}.entrypoints=websecure`,
      `traefik.http.routers.${containerName}.tls.certresolver=myresolver`,

      // 🔁 HTTP router (redirect)
      `traefik.http.routers.${containerName}-http.rule=Host(\`${domain}\`)`,
      `traefik.http.routers.${containerName}-http.entrypoints=web`,
      `traefik.http.routers.${containerName}-http.middlewares=redirect-to-https`,

      // 🔐 Middleware redirect
      `traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https`,

      // 🚀 Service
      `traefik.http.services.${containerName}.loadbalancer.server.port=${port}`,

      // 🔐 Security headers (important en prod)
      `traefik.http.middlewares.secure-headers.headers.stsSeconds=31536000`,
      `traefik.http.middlewares.secure-headers.headers.stsIncludeSubdomains=true`,
      `traefik.http.middlewares.secure-headers.headers.stsPreload=true`,
      `traefik.http.middlewares.secure-headers.headers.browserXssFilter=true`,
      `traefik.http.middlewares.secure-headers.headers.contentTypeNosniff=true`,

      `traefik.http.routers.${containerName}.middlewares=secure-headers`
    );
  } else {
    // 👉 fallback sans Traefik
    service.ports = [`${port}:${port}`];
  }

  service.labels = labels;
  service.networks = [networName];

  const r = await compose.upAll({
    log: true,
    cwd: config.services.core.baseDir,
    compose: {
      services: { core: service },
      networks: {
        [networName]: { external: true },
      },
    },
  });

  return r;
}
