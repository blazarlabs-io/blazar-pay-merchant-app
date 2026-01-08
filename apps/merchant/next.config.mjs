import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin("./next-intl.config.ts");


const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  // CSP is set in middleware.ts (nonce per request)
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "camera=()",
      "geolocation=()",
      "gyroscope=()",
      "microphone=()",
      "payment=()",
      "usb=()",
    ].join(", "),
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]
    : []),
  { key: "X-XSS-Protection", value: "0" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    outputFileTracingIncludes: {
      "/": ["./next-intl.config.ts"],
    }
  },
  serverExternalPackages: [],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true, // 🔑 Required for Lucid and UPLC WASM
    };

    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    config.externals = config.externals || [];
    config.externals.push({
      "node-beacon-scanner": "commonjs node-beacon-scanner",
      noble: "commonjs noble",
      "@abandonware/bluetooth-hci-socket":
        "commonjs @abandonware/bluetooth-hci-socket",
    });

    return config;
  },
};

export default withNextIntl(nextConfig);
