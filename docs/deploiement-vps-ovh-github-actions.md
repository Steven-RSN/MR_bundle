# Déploiement automatique – VPS OVH avec GitHub Actions

## Vue d'ensemble

```
Push sur main
     │
     ▼
GitHub Actions: CI (tests)
     │ ✓ si tous les tests passent
     ▼
GitHub Actions: CD (déploiement)
     │ via SSH
     ▼
VPS OVH Ubuntu – Docker Compose
     ├── conteneur: frontend (Nginx)
     ├── conteneur: backend (Node.js)
     └── conteneur: db (MySQL)
```

---

## 1. Prérequis

### Sur le VPS OVH
- Ubuntu 22.04 LTS
- Docker + Docker Compose installés (voir section 2)
- Accès SSH avec une clé RSA (pas de mot de passe)
- Ports ouverts : 80 (HTTP), 443 (HTTPS), 22 (SSH)

### Sur GitHub
- Dépôt GitHub avec le code source
- Accès aux **Settings → Secrets and variables → Actions**

---

## 2. Préparation du VPS (à faire une seule fois)

### 2.1 Se connecter au VPS
```bash
ssh ubuntu@<IP_DU_VPS>
```

### 2.2 Mettre à jour le système
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3 Installer Docker
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### 2.4 Vérifier l'installation
```bash
docker --version
docker compose version
```

### 2.5 Cloner le projet sur le VPS
```bash
sudo mkdir -p /opt/metr
sudo chown $USER:$USER /opt/metr
git clone https://github.com/<TON_COMPTE>/MetR.git /opt/metr
cd /opt/metr
```

### 2.6 Créer le fichier `.env` de production sur le VPS
```bash
nano /opt/metr/.env
```

Contenu minimal :
```env
DB_HOST=db
DB_PORT=3306
DB_USER=metr_user
DB_PASSWORD=<MOT_DE_PASSE_FORT>
DB_NAME=metr_prod
JWT_SECRET=<SECRET_JWT_FORT>
MYSQL_ROOT_PASSWORD=<ROOT_FORT>
MYSQL_DATABASE=metr_prod
MYSQL_USER=metr_user
MYSQL_PASSWORD=<MOT_DE_PASSE_FORT>
VITE_API_URL=https://marcheramasse.fr
```

> ⚠️ Ce fichier ne doit **jamais** être commité dans Git (il est déjà dans `.gitignore`).

### 2.7 Premier démarrage manuel
```bash
cd /opt/metr
docker compose up -d --build
```

Vérifier que les conteneurs tournent :
```bash
docker compose ps
```

---

## 3. Configurer les secrets GitHub

Dans **Settings → Secrets and variables → Actions** de ton dépôt GitHub, créer ces 3 secrets :

| Nom du secret | Valeur |
|---|---|
| `VPS_HOST` | L'adresse IP publique du VPS (ex: `51.210.xxx.xxx`) |
| `VPS_USER` | L'utilisateur SSH (ex: `ubuntu`) |
| `VPS_SSH_KEY` | La clé SSH privée (contenu complet du fichier `~/.ssh/id_rsa`) |

### Générer une clé SSH dédiée au déploiement

Sur ta machine locale :
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/metr_deploy
```

Copier la clé publique sur le VPS :
```bash
ssh-copy-id -i ~/.ssh/metr_deploy.pub ubuntu@<IP_DU_VPS>
```

Copier le contenu de la clé **privée** (`~/.ssh/metr_deploy`) dans le secret GitHub `VPS_SSH_KEY`.

---

## 4. Fonctionnement du pipeline CI/CD

### Fichiers concernés
- `.github/workflows/ci.yml` → Tests automatiques
- `.github/workflows/deploy.yml` → Déploiement automatique

### Schéma d'exécution

```
git push origin main
        │
        ▼
[ci.yml] Job 1: Tests backend
[ci.yml] Job 2: Tests unitaires Vitest
[ci.yml] Job 3: Tests E2E Cypress
        │
        │ (si tout est vert)
        ▼
[deploy.yml] Connexion SSH au VPS
             git pull origin main
             docker compose up -d --build
             docker image prune -f
```

> Si un test échoue, le déploiement **ne se déclenche pas**.

---

## 5. HTTPS avec Let's Encrypt (Certbot)

### 5.1 Installer Certbot sur le VPS
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 Pointer le domaine vers le VPS
Dans la console OVH, configurer l'enregistrement DNS :
```
Type A    marcheramasse.fr      → <IP_DU_VPS>
Type A    www.marcheramasse.fr  → <IP_DU_VPS>
```

Attendre la propagation DNS (jusqu'à 24h, souvent moins d'une heure).

### 5.3 Générer le certificat SSL
```bash
sudo certbot --nginx -d marcheramasse.fr -d www.marcheramasse.fr
```

### 5.4 Renouvellement automatique
Certbot installe automatiquement un timer systemd. Vérifier :
```bash
sudo systemctl status certbot.timer
```

---

## 6. Procédure de déploiement quotidien

Une fois configuré, le déploiement est entièrement automatique :

```bash
# Sur ta machine locale
git add .
git commit -m "feat: description de la modification"
git push origin main
```

→ GitHub Actions lance les tests puis déploie sur le VPS **sans intervention manuelle**.

---

## 7. Rollback (revenir à une version précédente)

En cas de problème après un déploiement :

```bash
# Sur le VPS via SSH
cd /opt/metr

# Voir l'historique des commits
git log --oneline -10

# Revenir au commit précédent
git checkout <HASH_DU_COMMIT_STABLE>
docker compose up -d --build
```

Ou forcer le retour en arrière depuis GitHub :
```bash
# Sur ta machine locale
git revert HEAD
git push origin main
# → déclenche un nouveau déploiement automatique avec la version corrigée
```

---

## 8. Commandes utiles sur le VPS

```bash
# Voir l'état des conteneurs
docker compose ps

# Voir les logs en direct
docker compose logs -f

# Voir les logs d'un seul service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Redémarrer un service
docker compose restart backend

# Arrêter toute la stack
docker compose down

# Mettre à jour et redémarrer manuellement
git pull origin main && docker compose up -d --build
```

---

## 9. Checklist avant mise en production

- [ ] Secrets GitHub configurés (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`)
- [ ] Fichier `.env` créé sur le VPS avec des valeurs de production sécurisées
- [ ] Premier déploiement manuel effectué (`docker compose up -d --build`)
- [ ] DNS pointé vers le VPS OVH
- [ ] Certificat SSL généré avec Certbot
- [ ] CI passe au vert sur GitHub Actions
- [ ] CD déclenché et déploiement automatique vérifié
- [ ] Application accessible sur https://marcheramasse.fr
