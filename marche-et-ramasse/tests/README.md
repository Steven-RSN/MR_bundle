# Tests - Commandes et configuration

## 1) Prerequis

- Node.js installe
- Dependances installees dans le front
- Cypress installe en devDependency

Commande d installation (si besoin):

```powershell
cd c:\Users\steve\Desktop\code\projet\MetR\marche-et-ramasse
npm install
```

## 2) Lancer le front (obligatoire avant Cypress)

```powershell
cd c:\Users\steve\Desktop\code\projet\MetR\marche-et-ramasse
npm run dev -- --host localhost --port 5173
```

Notes:
- Si le port 5173 est deja pris, Vite bascule souvent sur 5174.
- Dans ce cas, adapter la commande Cypress avec le bon baseUrl.

## 3) Lancer Cypress en mode visuel (fenetre interactive)

```powershell
cd c:\Users\steve\Desktop\code\projet\MetR\marche-et-ramasse
npx cypress open
```

Si tu es deja dans le dossier racine `MetR`, utilise cette commande:

```powershell
cd c:\Users\steve\Desktop\code\projet\MetR
npx cypress open --project "c:\Users\steve\Desktop\code\projet\MetR\marche-et-ramasse"
```

Puis dans l interface:
- E2E Testing
- Chrome
- Start E2E Testing
- Choisir le spec voulu

## 4) Lancer un spec en mode fenetre depuis le terminal

### 4.1 Test formulaire stable

```powershell
cd c:\Users\steve\Desktop\code\projet\MetR\marche-et-ramasse
npx cypress run --headed --browser chrome --config baseUrl=https://localhost:5173 --spec "cypress/e2e/formulaire_dechet_final.cy.js"
```

### 4.2 Test envoi local puis synchronisation

```powershell
cd c:\Users\steve\Desktop\code\projet\MetR\marche-et-ramasse
npx cypress run --headed --browser chrome --config baseUrl=https://localhost:5173 --spec "cypress/e2e/envoiDechetSyncro.cy.js"
```

Si Vite tourne en 5174, remplacer 5173 par 5174 dans la commande.

## 5) Lancer en headless (sans fenetre)

```powershell
cd c:\Users\steve\Desktop\code\projet\MetR\marche-et-ramasse
npx cypress run --browser chrome --config baseUrl=https://localhost:5173 --spec "cypress/e2e/envoiDechetSyncro.cy.js"
```

## 6) Configuration Cypress utilisee

Fichier de config:
- cypress.config.js

Points importants:
- baseUrl en HTTPS (localhost)
- insecureSkipVerify active (certificat local autosigne)
- chromeWebSecurity desactive
- timeouts augmentes

## 7) Specs E2E disponibles

- cypress/e2e/formulaire_dechet_final.cy.js
  - parcours utilisateur connecte
  - ajout image
  - geolocalisation simulee
  - envoi et message de succes

- cypress/e2e/envoiDechetSyncro.cy.js
  - ajout d un dechet avec serveur indisponible
  - verification du message de sauvegarde locale
  - ouverture de la page des dechets locaux
  - synchronisation quand disponible

## 8) Tests unitaires Vitest

Lancer tous les tests unitaires:

```powershell
cd c:\Users\steve\Desktop\code\projet\MetR\marche-et-ramasse
npm test
```

## 9) Depannage rapide

- Erreur package.json introuvable:
  - verifier que le terminal est bien dans marche-et-ramasse

- Cypress ne trouve pas l application:
  - verifier que npm run dev tourne
  - verifier le port (5173 ou 5174)
  - adapter --config baseUrl

- Certificat HTTPS local:
  - la config Cypress est deja preparee pour le certificat autosigne

## 10) Texte simple pour le memoire

### 10.1 Difference entre test unitaire et test E2E

Un test unitaire verifie une petite partie du code de maniere isolee. Dans ce projet, les tests Vitest du service API remplacent axios par un mock. Le test est rapide et permet de verifier la logique interne, mais il ne teste pas l interface utilisateur complete.

Un test E2E verifie un parcours utilisateur complet dans le navigateur. Avec Cypress, on voit les clics, la navigation, la saisie dans les champs et le resultat affiche a l ecran. Ce type de test est plus proche de la realite d usage.

### 10.2 Test E2E formulaire stable

Le fichier cypress/e2e/formulaire_dechet_final.cy.js verifie qu un utilisateur connecte peut remplir le formulaire, ajouter une image, soumettre la demande et voir un message de succes. Ce test valide le comportement visible du front et la coherence du flux de saisie.

### 10.3 Test E2E hors ligne puis synchronisation

Le fichier cypress/e2e/envoiDechetSyncro.cy.js couvre un cas reel de terrain: le serveur est indisponible au moment de l envoi. Le signalement est alors conserve localement, puis la synchronisation est relancee depuis la page des dechets locaux lorsque le serveur redevient disponible.

### 10.4 Conclusion

Les tests unitaires et les tests E2E sont complementaires. Les unitaires donnent un retour rapide sur la logique interne. Les E2E valident le parcours utilisateur complet, y compris les cas critiques comme le mode hors ligne et la synchronisation ulterieure.
