# Hebergement OVH VPS en production (Marche&Ramasse)

## Objectif
Deployer le projet Marche&Ramasse en production sur un VPS OVH Ubuntu avec:
- frontend Vue servi par Nginx
- backend Express
- base MySQL
- HTTPS via certificat SSL/TLS
- exploitation durable (sauvegarde, supervision, mises a jour)

Important:
- Un hebergement mutualise classique n est pas adapte a Node.js + Docker.
- Le choix coherent pour ce projet est bien un VPS (comme OVH VPS-1).

## 1. Architecture cible
- DNS: `marcheramasse.fr` et `www.marcheramasse.fr`
- Serveur: VPS OVH Ubuntu
- Reverse proxy: Nginx (entree web)
- Stack applicative: Docker Compose (frontend, backend, db)
- TLS: Let s Encrypt
- CI/CD: Jenkins local ou distant qui declenche deploiement sur VPS

## 2. Preparer le VPS (Ubuntu)
Connexion SSH au VPS puis:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg ufw git
```

Installer Docker + Compose plugin:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Se reconnecter a la session SSH pour appliquer le groupe docker.

## 3. Pare-feu et securite minimale
Configurer UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Bonnes pratiques:
- desactiver login root SSH
- utiliser cle SSH (pas mot de passe)
- activer fail2ban si possible

## 4. Deployer le code sur le VPS
Option recommandee: `git clone` (plus simple et traçable que SFTP pour la maintenance).

```bash
mkdir -p /opt/metr && cd /opt/metr
git clone <URL_DU_REPO> .
```

SFTP reste possible, mais a utiliser surtout pour depannage ou transfert ponctuel.

## 5. Variables de production
Creer un fichier `.env` cote backend (ou variables injectees compose/Jenkins) avec valeurs fortes:
- `JWT_SECRET` long et aleatoire
- mots de passe DB robustes
- URL backend/frontend correctes

Ne jamais commiter les secrets.

## 6. Lancer la stack en production
Depuis la racine du projet:

```bash
docker compose pull || true
docker compose up -d --build
```

Verifier:

```bash
docker compose ps
docker compose logs -f backend
```

## 7. HTTPS (obligatoire en production)

## 7.1 Pourquoi
- SFTP securise le transfert de fichiers admin.
- HTTPS securise les utilisateurs du site.
- Ces deux mecanismes sont complementaires et non substituables.

## 7.2 Mise en place type
Deux approches:
- Certbot directement sur l hote avec Nginx hote
- Reverse proxy TLS en conteneur (Traefik/Nginx + certbot)

Si tu gardes ton frontend Nginx en conteneur sur le port 80, ajoute une couche TLS en frontal (Nginx hote ou reverse proxy dedie) pour exposer 443 et gerer les certificats.

## 8. Sauvegardes et reprise
A minima sauvegarder:
- volume MySQL
- dossier uploads backend
- fichiers de configuration (`docker-compose.yml`, `.env` non versionne)

Exemple dump MySQL:

```bash
docker exec metr-db mysqldump -u root -p dechets_montagne > /opt/backup/dechets_montagne.sql
```

Plan conseille:
- dump quotidien
- retention 7 a 30 jours
- copie hors VPS (stockage externe)

## 9. Observabilite et maintenance
- logs: `docker compose logs`
- redemarrage auto: deja active via `restart: unless-stopped`
- mise a jour securite OS: hebdomadaire
- rotation de secrets: periodique

## 10. Procedure de deploiement continue (recommandee)
1. Push sur `main`
2. Jenkins lance build/tests
3. Jenkins deploie sur VPS via SSH:
   - `git pull`
   - `docker compose up -d --build`
4. Jenkins execute un smoke test HTTP

## 11. Checklist pre-production
- DNS `marcheramasse.fr` pointe vers IP VPS
- Ports 80/443 ouverts
- HTTPS actif et valide
- secrets non commites
- base et uploads sauvegardes
- redemarrage serveur teste
- rollback documente

## 12. Incoherences a eviter dans le rapport
- Ne pas melanger "hebergement mutualise" et "VPS": ce sont deux offres differentes.
- Pour Node.js + Docker + controle infra, parle de VPS et pas de mutualise classique.
