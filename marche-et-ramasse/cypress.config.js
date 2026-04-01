import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // En local : HTTPS (mkcert). En CI (GitHub Actions) : HTTP via CYPRESS_BASE_URL=http://...
    baseUrl: process.env.CYPRESS_BASE_URL || 'https://localhost:5173',
    
    // === OPTIONS CRITIQUES POUR CERTIFICAT AUTOSIGNÉ ===
    // Désactiver la vérification du certificat SSL/TLS
    // (Vite génère un certificat autosigné via mkcert)
    insecureSkipVerify: true,
    
    // Désactiver la vérification de sécurité Chrome
    // (permet de charger du contenu mixte HTTP/HTTPS si nécessaire)
    chromeWebSecurity: false,
    
    // User-Agent pour éviter les restrictions de navigateur
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    
    // ===  TIMEOUTS ===
    // Temps d'attente pour les commandes (en ms)
    defaultCommandTimeout: 15000,
    
    // Temps d'attente pour les requêtes réseau
    requestTimeout: 15000,
    
    // Temps avant que Cypress considère que la page est "chargée"
    pageLoadTimeout: 30000,
    
    // === CONFIGURATION ===
    // Support des fichiers (optionnel)
    supportFile: false,
    
    // Vitesse de saisie (ms entre chaque caractère)
    typeDelay: 50,
  },
});
