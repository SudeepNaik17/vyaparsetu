export default (phase) => ({
  distDir: phase === "phase-development-server" ? ".next-dev" : ".next",
  devIndicators: false,
  async rewrites() {
    const backend = (process.env.BACKEND_URL || "http://127.0.0.1:4000").trim().replace(/\/+$/, "");
    return [{ source: "/api/:path*", destination: backend + "/api/:path*" }];
  },
});
