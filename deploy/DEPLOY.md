# Deploying Epic Moments to AWS EC2

Single EC2 instance (Amazon Linux 2023). MongoDB stays on Atlas.

```
EC2 (Amazon Linux)
├── Nginx (80/443)  ->  static frontend + admin, proxies /api and /socket.io to backend
├── Node backend (PM2, :4000)
└── MongoDB Atlas (cloud)
```

Repo: https://github.com/DesignDynastySoftwares/Epic_Moments

---

## 1. Launch the instance

1. EC2 -> Launch instance -> Amazon Linux 2023, t3.small or larger recommended (micro instances need swap for builds).
2. Security group inbound rules: SSH 22 (your IP only), HTTP 80 and HTTPS 443 from 0.0.0.0/0.
3. Allocate an Elastic IP and associate it with the instance so the IP survives restarts.

---

## 2. Install prerequisites

```bash
sudo dnf update -y
sudo dnf install -y git nginx
sudo systemctl enable --now nginx

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20
npm install -g pm2
```

---

## 3. Clone the repo

```bash
cd ~
git clone https://github.com/DesignDynastySoftwares/Epic_Moments.git
```

---

## 4. Environment files (server only, gitignored)

```bash
cd ~/Epic_Moments
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin/.env.example admin/.env
vi backend/.env
vi frontend/.env
vi admin/.env
```

- backend: Mongo, JWT, Cloudinary, Razorpay live keys, Gmail
- frontend and admin: `VITE_BACKEND_URL=https://myepicmoments.com`, live Razorpay key in frontend

Vite variables are baked in at build time, so rebuild after changing them.

---

## 5. Web root and Nginx config

```bash
sudo mkdir -p /var/www/epicmoments/frontend /var/www/epicmoments/admin
sudo chown -R $USER:$USER /var/www/epicmoments
sudo cp ~/Epic_Moments/deploy/nginx.conf /etc/nginx/conf.d/epicmoments.conf
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. Build and deploy

```bash
cd ~/Epic_Moments
bash deploy/deploy.sh
```

Start PM2 on reboot:

```bash
pm2 startup
pm2 save
```

Run the sudo command that `pm2 startup` prints, then run `pm2 save` again. Confirm with `systemctl is-enabled pm2-ec2-user`.

---

## 7. DNS (GoDaddy)

| Type | Name  | Value      |
|------|-------|------------|
| A    | @     | Elastic IP |
| A    | www   | Elastic IP |
| A    | admin | Elastic IP |

Check with `dig @8.8.8.8 <name> +short` until all three return the Elastic IP.

---

## 8. HTTPS (Let's Encrypt)

```bash
sudo dnf install -y augeas-libs cronie
sudo systemctl enable --now crond
sudo python3 -m venv /opt/certbot
sudo /opt/certbot/bin/pip install certbot certbot-nginx
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d myepicmoments.com -d www.myepicmoments.com -d admin.myepicmoments.com
echo "0 0,12 * * * root /opt/certbot/bin/python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab
sudo certbot renew --dry-run
```

Certbot edits `/etc/nginx/conf.d/epicmoments.conf` directly. `deploy.sh` does not overwrite it, so HTTPS survives redeploys. The `deploy/nginx.conf` in the repo is the HTTP-only starting point. If you change it, apply the same change to the live file by hand.

---

## 9. Verify

- https://myepicmoments.com
- https://admin.myepicmoments.com
- https://myepicmoments.com/api/
- Place a small real Razorpay order to confirm payments.

---

## Updating later

```bash
cd ~/Epic_Moments
bash deploy/deploy.sh
```

Run it after pushing code to GitHub, or after changing `frontend/.env` or `admin/.env`. After changing `backend/.env`, `pm2 restart epic-backend` is enough.

## Useful commands

```bash
pm2 status
pm2 logs epic-backend
sudo tail -f /var/log/nginx/error.log
sudo systemctl reload nginx
sudo certbot renew --dry-run
```

## Notes

- MongoDB Atlas: add the Elastic IP under Network Access.
- Linux filenames are case-sensitive. An import like `./components/SendOrderMail` builds on Windows or macOS but fails here if the file is `sendOrderMail.jsx`.
- If a build prints "Killed", the instance ran out of memory. Add swap or use a larger instance type.
- Keep `.env` files on the server only.
