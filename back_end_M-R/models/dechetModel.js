const db = require('../config/db');
/*
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

*/


exports.ajouterSignalement = async (data) => {;
    const type_dechet = data.type_dechet;
    const commentaire = data.commentaire;
    const volume_litres = data.volume_litres;
    const poids_kg = data.poids_kg;
    const lieu = data.lieu;
    const latitude = data.latitude;
    const longitude = data.longitude;
    const id_user = data.id_user;
    const images = data.images || [];

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [volumeResult] = await conn.execute(
            `INSERT INTO volume (volume, weight) VALUES (?, ?)`,
            [volume_litres, poids_kg]
        );
        const id_volume = volumeResult.insertId;

        const [locationResult] = await conn.execute(
            `INSERT INTO location (location, latitude, longitude) VALUES (?, ?, ?)`,
            [lieu, latitude, longitude]
        );
        const id_location = locationResult.insertId;
        const [alertResult] = await conn.execute(
            `INSERT INTO alertWaste (name, description, id_volume, id_location, id_user)
             VALUES (?, ?, ?, ?, ?)`,
            [type_dechet, commentaire, id_volume, id_location, id_user]
        );
        const id_alertWaste = alertResult.insertId;
        await conn.commit();

        return { id_alertWaste, id_volume, id_location };
    } catch (err) {
        await conn.rollback();
        console.error("Erreur ajout signalement :", err);
        throw err;
    } finally {
        conn.release();
    }
};



exports.ajouterImage = (alertWasteId, imagePath) => {
    return db.execute(
        `INSERT INTO picture (id_alertWaste, path) VALUES (?, ?)`,
        [alertWasteId, imagePath]
    );
};
//rajouter groupconcate sur path
exports.findAll = async () => {
    const [rows] = await db.execute(
        `SELECT 
            a.id_alertWaste AS id,
            a.name AS type_dechet,
            a.description AS commentaire,
            a.id_user,
            v.volume AS volume_litres,
            v.weight AS poids_kg,
            l.location AS lieu,
            l.latitude,
            l.longitude,
            p.path AS path  
        FROM alertWaste AS a
        LEFT JOIN picture AS p ON p.id_alertWaste = a.id_alertWaste
        LEFT JOIN volume AS v ON a.id_volume = v.id_volume
        LEFT JOIN location AS l ON a.id_location = l.id_location`
    );
    return rows;
};

exports.findAlertAndUserById = async (id) => {
    const [rows] = await db.execute(
        `SELECT u.userPseudo, p.path, a.id_alertWaste, a.name, a.description, a.id_user, a.id_volume, a.id_location
         FROM alertWaste AS a
         LEFT JOIN picture AS p ON p.id_alertWaste = a.id_alertWaste
         INNER JOIN user AS u ON a.id_user = u.id_user
         WHERE a.id_alertWaste = ?`,
        [id]
    );
    return rows[0];
};

exports.findById = async (id) => {
    const [rows] = await db.execute(
        `SELECT p.path, a.id_alertWaste, a.name, a.description, a.id_user, a.id_volume, a.id_location
         FROM alertWaste AS a
         LEFT JOIN picture AS p ON p.id_alertWaste = a.id_alertWaste
         WHERE a.id_alertWaste = ?`,
        [id]
    );
    return rows[0];
};


exports.findDechetAndUserById = async (id) => {
    const [rows] = await db.execute(
        `SELECT 
            u.userPseudo AS pseudo,
            p.path AS image_path,
            a.id_alertWaste AS id,
            a.name AS type_dechet,
            a.description AS commentaire,
            a.id_user,
            v.volume AS volume_litres,
            v.weight AS poids_kg,
            l.location AS lieu,
            l.latitude,
            l.longitude
        FROM alertWaste AS a
        INNER JOIN picture AS p ON p.id_alertWaste = a.id_alertWaste
        INNER JOIN user AS u ON a.id_user = u.id_user
        LEFT JOIN volume AS v ON a.id_volume = v.id_volume
        LEFT JOIN location AS l ON a.id_location = l.id_location
        WHERE a.id_alertWaste = ?`,
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
