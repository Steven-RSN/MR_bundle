// Test E2E visuel et stable pour la page de signalement.
// Ce scenario simule un utilisateur connecte, ajoute une image,
// recupere une geolocalisation simulee, envoie le formulaire,
// puis verifie qu'un message de succes s'affiche.

describe('E2E - Formulaire de signalement', () => {
  beforeEach(() => {
    // On simule une session utilisateur persistée dans Pinia.
    // Le store user est persiste dans localStorage sous la cle "user".
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'user',
          JSON.stringify({
            id: 1,
            pseudo: 'Steve',
            email: 'steve@test.local',
            token: 'fake-jwt-token',
            toClean: []
          })
        );

        // On remplace la geolocalisation navigateur par une version controlee.
        Object.defineProperty(win.navigator, 'geolocation', {
          configurable: true,
          value: {
            getCurrentPosition(success) {
              success({
                coords: {
                  latitude: 43.6045,
                  longitude: 1.444,
                  accuracy: 10
                }
              });
            },
            watchPosition() {
              return 1;
            },
            clearWatch() {}
          }
        });
      }
    });

    // On vide IndexedDB avant chaque test pour repartir d'un etat propre.
    cy.window().then((win) => {
      win.indexedDB.deleteDatabase('MarcheEtRamasseDB');
    });

    // On intercepte l'appel HTTP pour obtenir un test stable et visible.
    cy.intercept('POST', '**/dechets/registerDechet', {
      statusCode: 200,
      body: { success: true }
    }).as('registerDechet');
  });

  it('remplit le formulaire puis affiche un message de succes', () => {
    // 1. Aller sur la vue formulaire.
    cy.contains('a, button', /Signaler|Formulaire|Dechet/i, { timeout: 8000 })
      .click({ force: true });

    cy.contains(/Signaler un déchet|Signaler un dechet|Formulaire/i, { timeout: 8000 })
      .should('be.visible');

    // 2. Ajouter une image.
    // L'application declenche la geolocalisation lors de l'ajout de fichiers.
    cy.get('input[type="file"]', { timeout: 8000 }).selectFile(
      {
        contents: Cypress.Buffer.from('fake-image-content'),
        fileName: 'photo-test.png',
        mimeType: 'image/png',
        lastModified: Date.now()
      },
      { force: true }
    );

    // 3. Remplir les champs visibles.
    cy.get('#lieu', { timeout: 8000 }).clear({ force: true }).type('Parc municipal', { force: true });
    cy.get('select', { timeout: 8000 }).select('plastique', { force: true });
    cy.get('#volume', { timeout: 8000 }).clear({ force: true }).type('8', { force: true });
    cy.get('#poids', { timeout: 8000 }).clear({ force: true }).type('3', { force: true });
    cy.get('textarea', { timeout: 8000 }).type('Depot de dechets detecte dans le parc', { force: true });

    // 4. Soumettre le formulaire.
    cy.contains('button', /Ajouter le déchet|Ajouter le dechet|Envoyer|Soumettre/i, { timeout: 8000 })
      .click({ force: true });

    // 5. Verifier que la requete part bien avec les bonnes donnees.
    cy.wait('@registerDechet').then(({ request }) => {
      expect(request.body.lieu).to.equal('Parc municipal');
      expect(request.body.type_dechet).to.equal('plastique');
      expect(request.body.latitude).to.equal(43.6045);
      expect(request.body.longitude).to.equal(1.444);
      expect(request.body.images).to.have.length(1);
    });

    // 6. Verifier le retour visuel utilisateur.
    cy.contains('Les données ont été enregistrées !', { timeout: 8000 })
      .should('be.visible');
  });
});
