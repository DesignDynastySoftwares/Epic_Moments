# Deploying Epic Moments to Oracle Cloud (OCI)

This guide deploys the full stack on a single **Oracle Cloud free-tier VM**
(Ubuntu). MongoDB stays on **Atlas** (already in use).

```
Oracle VM (Ubuntu)
├── Nginx (80/443)  →  static frontend + admin, proxies /api to backend
├── Node backend (PM2, :4000)
└── MongoDB Atlas (cloud)
```

Repo: https://github.com/DesignDynastySoftwares/Epic_Moments

---

## 1. Create the Oracle Cloud VM

1. Sign in to **cloud.oracle.com** → **Compute → Instances → Create Instance**.
2. Image: **Canonical Ubuntu 22.04**. Shape: **VM.Standard.A1.Flex** (Always Free —
   up to 4 OCPU / 24 GB) or an Always-Free AMD micro shape.
3. Add your **SSH public key** (download the private key).
4. Create. Note the **public IP**.

### Open ports (firewall)
- In OCI console: **VCN → Security List** → add **Ingress rules** for TCP **80**
  and **443** from `0.0.0.0/0`.
- On the VM itself:
  ```bash
  sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
  sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
  sudo netfilter-persistent save
  ```

---

## 2. Connect + install prerequisites

```bash
ssh -i /path/to/private-key ubuntu@<VM_PUBLIC_IP>

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Nginx, git, PM2
sudo apt-get update
sudo apt-get install -y nginx git
sudo npm install -g pm2
```

---

## 3. Clone the repo

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone https://github.com/DesignDynastySoftwares/Epic_Moments.git epicmoments-src
```

---

## 4. Add environment files (secrets — server only)

```bash
cd /var/www/epicmoments-src

# Backend
cp backend/.env.example backend/.env
nano backend/.env          # fill real Mongo, JWT, Cloudinary, Razorpay LIVE, Gmail

# Frontend (build-time)
cp frontend/.env.example frontend/.env
nano frontend/.env         # VITE_BACKEND_URL=https://myepicmoments.com , live Razorpay key

# Admin (build-time)
cp admin/.env.example admin/.env
nano admin/.env            # VITE_BACKEND_URL=https://myepicmoments.com
```

---

## 5. Build + deploy

```bash
cd /var/www/epicmoments-src
mkdir -p /var/www/epicmoments/{frontend,admin}
bash deploy/deploy.sh
```

The script builds frontend + admin, copies the `dist/` output to
`/var/www/epicmoments/`, and starts the backend under PM2.

Make PM2 start on reboot:
```bash
pm2 startup      # run the command it prints
pm2 save
```

---

## 6. Configure Nginx

```bash
sudo cp /var/www/epicmoments-src/deploy/nginx.conf \
        /etc/nginx/sites-available/epicmoments
sudo ln -s /etc/nginx/sites-available/epicmoments /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Point the domain (DNS)

At your domain registrar for **myepicmoments.com**:

| Type | Name  | Value            |
|------|-------|------------------|
| A    | @     | `<VM_PUBLIC_IP>` |
| A    | www   | `<VM_PUBLIC_IP>` |
| A    | admin | `<VM_PUBLIC_IP>` |

Wait for DNS to propagate (minutes–hours).

---

## 8. HTTPS (free SSL via Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx \
  -d myepicmoments.com -d www.myepicmoments.com -d admin.myepicmoments.com
```
Certbot updates the Nginx config to serve HTTPS and auto-renews.

---

## 9. Verify

- Storefront: `https://myepicmoments.com`
- Admin: `https://admin.myepicmoments.com`
- API health: `https://myepicmoments.com/api/...`
- Place a small real Razorpay order (₹1–10) to confirm payments.
- Google Search Console → verify + submit `https://myepicmoments.com/sitemap.xml`.

---

## Updating later (after code changes)

```bash
cd /var/www/epicmoments-src
bash deploy/deploy.sh
```
Pulls latest `main`, rebuilds, redeploys, restarts backend, reloads Nginx.

---

## Useful commands

```bash
pm2 status                 # backend process
pm2 logs epic-backend      # backend logs
sudo tail -f /var/log/nginx/error.log
sudo systemctl reload nginx
```

## Notes
- Keep `backend/.env`, `frontend/.env`, `admin/.env` on the server only (gitignored).
- MongoDB Atlas: allow the VM's public IP in **Atlas → Network Access**.
- If the frontend can't reach the API, confirm `VITE_BACKEND_URL` and rebuild
  (Vite env vars are baked in at build time).
