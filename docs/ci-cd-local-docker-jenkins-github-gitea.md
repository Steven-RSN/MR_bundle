# CI/CD local avec Docker, Jenkins et GitHub/Gitea (MetR)

## Objectif
Mettre en place un pipeline CI/CD local pour le projet Marche&Ramasse avec:
- build et execution des services via Docker Compose
- integration continue via Jenkins
- declenchement automatique via webhook GitHub ou Gitea

Cette documentation est basee sur la structure actuelle du projet:
- backend Express: `back_end_M-R`
- frontend Vue/Vite: `marche-et-ramasse`
- orchestration locale: `docker-compose.yml` (racine)

## 1. Prerequis
- Docker Desktop installe et demarre
- Git installe
- Java 17+ si Jenkins est lance hors Docker
- Un depot GitHub ou Gitea contenant le code
- Ports libres en local:
  - 80 (frontend Nginx)
  - 3000 (backend dans le reseau Docker)
  - 3306 (MySQL dans le reseau Docker)
  - 8080 (Jenkins)

## 2. Fichiers Docker deja en place et role

### 2.1 Backend
Fichier: `back_end_M-R/Dockerfile`
- image de base `node:20-alpine`
- installation dependances prod (`npm ci --omit=dev`)
- expose port 3000
- lance `npm start`

Fichier: `back_end_M-R/.dockerignore`
- exclut les fichiers inutiles du contexte de build

### 2.2 Frontend
Fichier: `marche-et-ramasse/Dockerfile`
- build multi-stage:
  - stage Node pour `npm ci` + `npm run build`
  - stage Nginx pour servir `dist/`

Fichier: `marche-et-ramasse/nginx.conf`
- sert le frontend Vue
- proxy `/api` vers `backend:3000`
- proxy `/uploads` vers le backend
- `try_files` pour routes SPA Vue

### 2.3 Orchestration
Fichier: `docker-compose.yml` (racine)
- service `db` (MySQL)
- service `backend` (Express)
- service `frontend` (Nginx)
- reseau interne dedie
- volume persistant MySQL

## 3. Lancement local manuel (base de reference)
Depuis la racine du workspace:

```powershell
docker compose up -d --build
```

Verification:

```powershell
docker compose ps
docker compose logs -f backend
```

Arret:

```powershell
docker compose down
```

Arret + suppression volume DB (reset complet):

```powershell
docker compose down -v
```

## 4. Jenkins local via Docker

## 4.1 Creer un fichier Jenkins Compose
Creer un fichier `docker-compose.jenkins.yml` a la racine avec:

```yaml
services:
  jenkins:
    image: jenkins/jenkins:lts-jdk17
    container_name: metr-jenkins
    user: root
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    restart: unless-stopped

volumes:
  jenkins_home:
```

Lancement Jenkins:

```powershell
docker compose -f docker-compose.jenkins.yml up -d
```

Recuperer le mot de passe initial:

```powershell
docker exec metr-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Ouvrir Jenkins: `http://localhost:8080`

## 4.2 Plugins Jenkins recommandes
- Pipeline
- Git
- GitHub Integration
- Gitea
- Docker Pipeline
- Credentials Binding

## 5. Pipeline Jenkins adapte a ce projet
Le `back_end_M-R/Jenkinsfile` actuel execute seulement un test backend dans un conteneur Node. Pour un pipeline CI/CD local complet, utiliser un Jenkinsfile de ce type:

```groovy
pipeline {
  agent any

  environment {
    COMPOSE_PROJECT_NAME = 'metr-ci'
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Lint/Test Frontend') {
      steps {
        dir('marche-et-ramasse') {
          sh 'npm ci'
          sh 'npm run build'
          sh 'npm test -- --run || true'
        }
      }
    }

    stage('Install Backend') {
      steps {
        dir('back_end_M-R') {
          sh 'npm ci'
        }
      }
    }

    stage('Build Images') {
      steps {
        sh 'docker compose build --no-cache'
      }
    }

    stage('Deploy Local Stack') {
      steps {
        sh 'docker compose up -d'
      }
    }

    stage('Healthcheck') {
      steps {
        sh 'docker compose ps'
      }
    }
  }

  post {
    always {
      sh 'docker compose logs --no-color > ci-logs.txt || true'
      archiveArtifacts artifacts: 'ci-logs.txt', onlyIfSuccessful: false
    }
    cleanup {
      sh 'docker compose down || true'
    }
  }
}
```

Notes importantes:
- La commande `npm test` backend n est pas definie actuellement dans `back_end_M-R/package.json`.
- Si tu veux tester le backend dans Jenkins, ajoute un script `test` dans ce package.
- Le `|| true` sur le test frontend permet de ne pas bloquer tant que la strategie de tests n est pas finalisee.

## 6. Raccorder Jenkins a GitHub ou Gitea

## 6.1 Webhook GitHub
1. Jenkins: creer un job Pipeline base sur le `Jenkinsfile` du repo.
2. Cocher "GitHub hook trigger for GITScm polling".
3. GitHub > Settings > Webhooks:
   - Payload URL: `http://<jenkins-host>:8080/github-webhook/`
   - Content type: `application/json`
   - Event: push (minimum)
4. Ajouter un token/credential si le repo est prive.

## 6.2 Webhook Gitea
1. Installer plugin Gitea dans Jenkins.
2. Jenkins: configurer serveur Gitea (URL + token API).
3. Dans le repo Gitea > Webhooks:
   - URL Jenkins (endpoint plugin Gitea)
   - Event push
4. Verifier la reception des events dans les logs Jenkins.

## 7. Strategie de branches conseillee
- `main`: branche stable de deploiement
- `develop`: integration continue
- `feature/*`: branches de dev

Regles minimales:
- PR obligatoire vers `develop` ou `main`
- pipeline Jenkins vert avant merge

## 8. Secrets et variables
Ne jamais commiter de vrais secrets.
- Variables backend critiques:
  - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `JWT_SECRET`
- Jenkins:
  - stocker dans Credentials, puis injecter dans le pipeline

## 9. Probleme courant et resolution rapide
- Build frontend echoue: verifier Node version et lockfile
- Backend KO au demarrage: verifier variables DB
- Jenkins ne declenche pas: tester webhook et exposition reseau
- `npm test` backend echoue: script absent dans package backend

## 10. Checklist CI/CD local
- Docker Compose local demarre sans erreur
- Jenkins accessible en local
- Job pipeline cree et relie au repo
- Webhook GitHub/Gitea fonctionnel
- Build images OK
- Deploiement local automatique OK
- Logs archives dans Jenkins
