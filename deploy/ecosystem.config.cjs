// ============================================================
//  Epic Moments — PM2 process config for the Node backend
//  Usage (from repo root on the VM):
//    pm2 start deploy/ecosystem.config.cjs
//    pm2 save
//    pm2 startup      # then run the printed command (auto-start on reboot)
// ============================================================
module.exports = {
  apps: [
    {
      name: "epic-backend",
      cwd: "./backend",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      // Backend reads secrets from backend/.env (via dotenv). Keep that file
      // on the server only; do NOT commit it.
    },
  ],
};
