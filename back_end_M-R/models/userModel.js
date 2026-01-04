// Requêtes BDD (CommonJS exports)
const db = require('../config/db');

/**
 * Vérifie si un email existe déjà dans la base de données.
 * @param {string} email - L'email à vérifier.
 * @returns {boolean} - Retourne true si l'email existe, sinon false.
 */
async function emailExists(email) {
    const sql = 'SELECT email FROM users WHERE email = ?';
    try {
        const [rows] = await db.execute(sql, [email]);

        if (rows.length === 0) {
            return false;
        }
        return true;

    } catch (err) {
        throw err;
    }
}

async function getUserByEmail(email) {
    const sql = 'SELECT id_user, pseudo ,email,password_hash FROM users WHERE email=?';
    try {
        const [rows] = await db.execute(sql, [email]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0]
    } catch (err) {
        console.error('Erreur getUserByEmail:', err);
        throw err;

    }
}

// Créer un nouvel utilisateur
async function createUser(newUser) {
    const sql = "INSERT INTO users (pseudo, email, password_hash ) VALUES (?, ?, ?)";
    try {
        const [result] = await db.execute(sql, newUser);
        if (!result.insertId) {
            throw new Error('Erreur lors de la création de l\'utilisateur');
        }
        return result.insertId;

    } catch (err) {
        throw err;
    }
}

async function getProfilUserById(id) {
    const sql = 'SELECT d.type_dechet, d.volume_litres, d.poids_kg, d.lieu, d.commentaire, d.latitude, d.longitude, d.date_signalement FROM users AS u INNER JOIN dechets AS d ON u.id_user = d.user_id WHERE u.id_user=? GROUP BY(d.id)'
    try {
        const [rows] = await db.execute(sql, [id])
        console.log("row", rows)
        if (rows.length === 0) {
            return []
        }
        return [rows]
    } catch (err) {
        console.error('Erreur getProfilUserById:', err);
        throw err;
    }

}

module.exports = {
    emailExists,
    createUser,
    getUserByEmail,
    getProfilUserById,
};

// Nouvelles requêtes
//const db = require('../config/db');

/**
 * Vérifie si un email existe déjà dans la base de données.
 * @param {string} email - L'email à vérifier.
 * @returns {boolean} - Retourne true si l'email existe, sinon false.
 */
async function emailExists(email) {
    const sql = 'SELECT userEmail FROM `user` WHERE userEmail = ?';
    try {
        const [rows] = await db.execute(sql, [email]);

        return rows.length > 0;

    } catch (err) {
        throw err;
    }
}

/**
 * Récupère un utilisateur par email.
 * @param {string} email - L'email de l'utilisateur.
 * @returns {object|null} - Retourne l'utilisateur ou null si non trouvé.
 */
async function getUserByEmail(email) {
    const sql = 'SELECT id_user, userPseudo, userEmail, userPassword FROM `user` WHERE userEmail=?';
    try {
        const [rows] = await db.execute(sql, [email]);
        if (rows.length === 0) return null;
        return rows[0];
    } catch (err) {
        console.error('Erreur getUserByEmail:', err);
        throw err;
    }
}

/**
 * Crée un nouvel utilisateur.
 * @param {Array} newUser - [userPseudo, userEmail, userPassword]
 * @returns {number} - L'ID du nouvel utilisateur.
 */
async function createUser(newUser) {
    const sql = "INSERT INTO `user` (userPseudo, userEmail, userPassword) VALUES (?, ?, ?)";
    try {
        const [result] = await db.execute(sql, newUser);
        if (!result.insertId) {
            throw new Error("Erreur lors de la création de l'utilisateur");
        }
        return result.insertId;
    } catch (err) {
        throw err;
    }
}

/**
 * Récupère les signalements d'un utilisateur par son ID.
 * @param {number} id - ID de l'utilisateur.
 * @returns {Array} - Liste des signalements.
 */
async function getProfilUserById(id) {
    const sql = `
    SELECT 
        aw.name AS nameAlert,
        v.volume AS volume,
        v.weight AS weight,
        l.location AS locationName,
        l.latitude,
        l.longitude,
        aw.description AS description
    FROM \`user\` AS u
    INNER JOIN alertWaste AS aw ON u.id_user = aw.id_user
    INNER JOIN volume AS v ON aw.id_volume = v.id_volume
    INNER JOIN location AS l ON aw.id_location = l.id_location
    WHERE u.id_user = ?
    ORDER BY aw.id_alertWaste DESC`;

    try {
        const [rows] = await db.execute(sql, [id]);
        return rows; // retourne un tableau vide si aucun signalement
    } catch (err) {
        console.error('Erreur getProfilUserById:', err);
        throw err;
    }
}

module.exports = {
    emailExists,
    createUser,
    getUserByEmail,
    getProfilUserById,
};
