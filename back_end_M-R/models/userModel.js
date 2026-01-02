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
