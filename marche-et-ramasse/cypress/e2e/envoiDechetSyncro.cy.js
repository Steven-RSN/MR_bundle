// Test E2E separe pour le cas hors ligne puis synchronisation.


describe('E2E -> Envoi des donnée du dechet puis synchronisation', () => {
  beforeEach(() => {
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
  });

  it('enregistre le dechet en local puis synchronise', () => {
    //Simule un serveur non indisponible
    cy.intercept({ method: 'POST',url: '**/dechets/registerDechet',times: 1 }, {
      statusCode: 503,
      body: { message: 'Serveur indisponible' }
    }).as('registerOffline');

    //navigue ver le formulaire
    cy.contains('a, button', /Signaler|Formulaire|Dechet/i).click();
    cy.contains(/Signaler un déchet|Signaler un dechet|Formulaire/i).should('be.visible');

    // Ajout img
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('fake-image-content-offline'),
        fileName: 'photo-offline.png',
        mimeType: 'image/png',
        lastModified: Date.now()
      },
      { force: true }
    );

    // Donnée du formulaire
    cy.get('#lieu').clear().type('Quai de Garonne');
    cy.get('select').select('verre');
    cy.get('#volume').clear().type('5');
    cy.get('#poids').clear().type('2');
    cy.get('textarea').type('Dépôt de bouteilles en verre sur les berges.');

    // Envoyer les données formulaire
    cy.contains('button', /Ajouter le déchet|Ajouter le dechet|Envoyer|Soumettre/i).click();

    cy.wait('@registerOffline');

   // Verifie qu'un message pour la sauvegarde locale s'affiche
    cy.contains(/Hors ligne ou serveur indisponible|enregistre localement|enregistré localement/i, { timeout: 12000 })
    .should('be.visible');

    // Ferme la modal (btn "OK")
    cy.get('body').then(($body) => {
      if ($body.text().includes('OK')) {
        cy.contains('button', 'OK').click({ force: true });
      }
    });

    // Simule une reponse serveur pour la synchro
    cy.intercept('POST', '**/dechets/registerDechet', {
      statusCode: 200,
      body: { success: true }
    }).as('registerOnline');

    // Bloque la synchro autopour tester la syncro manuellement de l'utilisateur.
    cy.visit('/local-dechets', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'onLine', {
          configurable: true,
          get: () => false
        });
      }
    });
    cy.contains(/Mes signalements locaux/i).should('be.visible');

    //Verifier qu'il y a un signalement local
    cy.contains(/Quai de Garonne/i, { timeout: 12000 }).should('be.visible');

    // Navigue vers la fiche du dechet
    cy.contains(/Quai de Garonne/i).click();

    // Verifier que la navigation a eu lieu
    cy.url({ timeout: 8000 }).should('include', '/fiche-locale/');

    // Verifier le contenu la fiche du dechet
    cy.contains(/Déchet signalé : Quai de Garonne|Dechet signale : Quai de Garonne/i, { timeout: 8000 }).should('be.visible');
    cy.contains(/Dépôt de bouteilles en verre sur les berges/i).should('exist');

    // Revenir sur la page des dechets locaux
    cy.contains('button', /Retour aux déchets locaux|Retour aux dechets locaux/i).click();
    cy.url({ timeout: 8000 }).should('include', '/local-dechets');
    cy.contains(/Mes signalements locaux/i).should('be.visible');

    //Synchroniser le dechet
    cy.contains('button', /Synchroniser tous/i).click();
    cy.wait('@registerOnline');

    // 13. Verifier la synchro
    cy.contains(/Synchronisation terminée|Synchronisation terminee/i, { timeout: 12000 }).should('exist');

    // Fermer la modal
    cy.contains('button', 'OK').click({ force: true });
    cy.contains(/Aucun signalement local en attente/i, { timeout: 12000 }).should('be.visible');
  });
});
