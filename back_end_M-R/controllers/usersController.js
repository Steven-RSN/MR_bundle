const bcrypt = require('bcrypt');
const usersModel = require('../models/userModel');
const { generateAccessToken, authenticateToken } = require('../utils/token');
exports.register = async (req, res) => {
    console.log('User connecté via token :', req.user); // vérifier les infos du user
    console.log('Body reçu :', req.body); // vérifier les données envoyées
    try {
        const { pseudo, email, password, confirmPassword } = req.body;

        // Validation des champs
        if (!pseudo || !email || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
        }

        const reg = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$/;
        if (!reg.test(password)) {
            return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Les mots de passe ne correspondent pas' });
        }

        // Vérifier si l'utilisateur existe déjà
        if (await usersModel.emailExists(email)) {
            // L'utilisateur existe déjà
            return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' });
        }

        // Hacher le mot de passe

        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer le nouvel utilisateur
        const newUser = [
            pseudo,
            email,
            hashedPassword,
        ];

        // Enregistrer l'utilisateur dans la base de données
        const insertId = await usersModel.createUser(newUser);

        // Répondre au client
        return res.status(201).json({ success: true, message: 'Utilisateur créé avec succès', id: insertId });

    } catch (err) {
        console.error('usersController.register error:', err);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation des champs
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
        }

        // Vérifier si l'utilisateur existe déjà
        const user = await usersModel.getUserByEmail(email)
        console.log('Utilisateur trouvé:', user);
        if (!user) {
            // utilisateur existe déjà
            return res.status(409).json({ success: false, message: 'Compte non trouvé' });
        }

        // Vérification du mot de passe !!!!!
        const verifyPassword = await bcrypt.compare(password, user.password_hash);

        if (!verifyPassword) {
            return res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
        }
        delete user.password_hash
        console.log('user sans password', user);
        const accessToken = generateAccessToken(user);
        console.log('accessToken', accessToken);

        // Connexion réussie !
        return res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            user: {
                id: user.id_user,
                pseudo: user.pseudo,
                email: user.email,
                token: accessToken,
            }
        });


    } catch (err) {
        console.error('Erreur login:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur !!!!!' });
    }
}

exports.profil = async (req, res) => {
    try {
        const id = req.params.id

        const profil = await usersModel.getProfilUserById(id)
        if (!profil) {
            return res.status(404).json({ error: 'Profil Utilisateur non trouvé' });
        }

        console.log(profil)
        res.json(profil)


    } catch (err) {
        console.error('Erreur login:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur !!!!!' });
    }
}