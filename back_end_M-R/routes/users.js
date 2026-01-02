const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Route pour créer un nouvel utilisateur (inscription)
router.post('/register', usersController.register);

// Route pour la connexion d'un utilisateur
router.post('/login', usersController.login);

router.get('/profil/:id',usersController.profil)

// // Route pour obtenir la liste des utilisateurs
// router.get('/', usersController.getAllUsers);

// // Route pour obtenir un utilisateur spécifique
// router.get('/:id', usersController.getUserById);

// // Route pour modifier un utilisateur
// router.put('/:id', usersController.updateUser);

// // Route pour supprimer un utilisateur
// router.delete('/:id', usersController.deleteUser);

module.exports = router;