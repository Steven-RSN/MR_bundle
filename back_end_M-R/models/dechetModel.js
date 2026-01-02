const db = require('../config/db');

exports.ajouter = async (data) => {
    const { id_user, type_dechet, volume_litres, poids_kg, lieu, commentaire, latitude, longitude } = data;

    console.log("DB INSERT DATA:", data);
    try {
        const [result] = await db.execute(
            `INSERT INTO dechets 
            (user_id, type_dechet, volume_litres, poids_kg, lieu, commentaire, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_user, type_dechet, volume_litres, poids_kg, lieu, commentaire, latitude, longitude]
        );

        console.log("INSERT OK, result:", result);
        return result; // result.insertId sera accessible
    } catch (err) {
        console.error("Erreur INSERT DB:", err);
        throw err; // permettra au try/catch du contrôleur de catcher l'erreur
    }
};

exports.ajouterImage = (dechetId, imageUrl) => {

    return new Promise((resolve, reject) => {

        db.execute(
            `INSERT INTO images_dechets (dechet_id, image_base64) VALUES (?, ?)`,
            [dechetId, imageUrl],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );

    });
};


exports.findAll = async () => {
    const [rows] = await db.execute(
       ' SELECT i.image_base64, d.id, d.user_id, d.type_dechet, d.volume_litres, d.poids_kg, d.lieu, d.commentaire, d.latitude, d.longitude, d.date_signalement FROM dechets AS d INNER JOIN  images_dechets AS i ON i.dechet_id= d.id'
    );
    return rows;
}


exports.findDechetAndUserById = async (id) => {
    const [rows] = await db.execute(
        ' SELECT u.pseudo, i.image_base64, d.id, d.user_id, d.type_dechet, d.volume_litres, d.poids_kg, d.lieu, d.commentaire, d.latitude, d.longitude, d.date_signalement FROM dechets AS d INNER JOIN  images_dechets AS i ON i.dechet_id= d.id INNER JOIN users AS u ON d.user_id = u.id_user WHERE d.id=?',
        [id] 
    );
    return rows[0];
}



exports.findById = async (id) => {
    const [rows] = await db.execute(
        ' SELECT i.image_base64, d.id, d.user_id, d.type_dechet, d.volume_litres, d.poids_kg, d.lieu, d.commentaire, d.latitude, d.longitude, d.date_signalement FROM dechets AS d INNER JOIN  images_dechets AS i ON i.dechet_id= d.id WHERE d.id=?',
        [id] 
    );
    return rows[0];
}



// // Créer un nouveau produit
// async function create({ name, description, price }) {
//     const [result] = await pool.execute(
//         'INSERT INTO products (name, description, price) VALUES (?, ?, ?)',
//         [name, description, price]
//     );

//     // récupérer le produit créé
//     const [rows] = await pool.execute(
//         'SELECT id, name, description, price, created_at FROM products WHERE id = ?',
//         [result.insertId]
//     );
//     return rows[0];
// }


// exports.ajouter = (data) => {
//     const { type_dechet, volume_litres, poids_kg, lieu, commentaire, latitude, longitude } = data;
//     return db.execute(
//         `INSERT INTO dechets
//         (type_dechet, volume_litres, poids_kg, lieu, commentaire, latitude, longitude)
//         VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [type_dechet, volume_litres, poids_kg, lieu, commentaire, latitude, longitude],
//         (err, result) => {
//             if (err) return reject(err);
//             resolve(result);
//         }
//     );
// };

// exports.ajouterImage = (dechetId, imageUrl) => {
//     return db.execute(
//         `INSERT INTO images_dechets (dechet_id, image_base64) VALUES (?, ?)`,
//         [dechetId, imageUrl]
//     );
// };
