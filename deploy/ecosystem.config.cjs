const path = require("path");

module.exports = {
  apps: [
    {
      name: "epic-backend",
      cwd: path.join(__dirname, "..", "backend"),
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
