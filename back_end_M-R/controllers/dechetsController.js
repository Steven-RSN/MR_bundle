const dechetsModel = require('../models/dechetModel')
const fs = require('fs')
const path = require('path')

exports.ajoutDechet = async (req, res) => {
    try {
        const { idUser, type_dechet, volume_litres, poids_kg, lieu, commentaire, latitude, longitude, images } = req.body;

        //NETTOYER LES CHAMPS
        // Créer le déchet dans la base
        console.log('ICI LES CONSOLE.LOG PASSENT')
        const result = await dechetsModel.ajouter({
            id_user: idUser,
            type_dechet,
            volume_litres,
            poids_kg,
            lieu,
            commentaire,
            latitude,
            longitude
        });
        console.log("-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------")
        // console.log("Résultat INSERT :", result);
        const dechetId = result.insertId;
        // { fieldCount: 0, affectedRows: 1, insertId: 5, ... }
        console.log("insertId :", result.insertId)

        // Créer dossier uploads si inexistant
        const uploadDir = path.join(__dirname, '../uploads', `${dechetId}`);
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        console.log("images", images)
        console.log("images length", images.length)

        // Parcourir les images Base64 et les sauvegarder
        if (images && images.length) {
            for (let i = 0; i < images.length; i++) {
                const base64Data = images[i].replace(/^data:image\/\w+;base64,/, '');
                const ext = images[i].match(/^data:image\/(\w+);base64,/)[1];
                const fileName = `img_${i}.${ext}`;
                const filePath = path.join(uploadDir, fileName);

                fs.writeFileSync(filePath, base64Data, 'base64');

                // Sauvegarder le chemin dans la DB
                await dechetsModel.ajouterImage(dechetId, `/uploads/${dechetId}/${fileName}`);

            }
        }
        res.json({ success: true, id: dechetId });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
}


exports.getAllDechet = async (req, res) => {
    try {
        const dechetsData = await dechetsModel.findAll();
        const dechets = [];
        console.log("les datas", dechetsData)
        for (const row of dechetsData) {
            // Cherche si le déchet existe déjà
            let existingDechet = dechets.find(d => d.id === row.id);

            if (!existingDechet) {
                existingDechet = {
                    id: row.id,
                    user_id: row.user_id,
                    type_dechet: row.type_dechet,
                    volume_litres: row.volume_litres,
                    poids_kg: row.poids_kg,
                    lieu: row.lieu,
                    commentaire: row.commentaire,
                    latitude: row.latitude,
                    longitude: row.longitude,
                    date_signalement: row.date_signalement,
                    images: []
                };
                dechets.push(existingDechet);
            }

            // Si pas d'image, passe au suivant
            if (!row.image_base64) {
                console.warn(`Aucune image pour ce déchet id=${row.id}`);
                continue;
            }

            try {
                const fullPath = path.join(__dirname, '..', row.image_base64);

                if (!fs.existsSync(fullPath)) {
                    console.warn(`Fichier image non trouvé : ${fullPath}`);
                    continue;
                }

                const ext = path.extname(fullPath).substring(1);
                const base64 = fs.readFileSync(fullPath, { encoding: 'base64' });
                const dataUri = `data:image/${ext};base64,${base64}`;

                existingDechet.images.push(dataUri);

            } catch (err) {
                console.error("Erreur lecture image :", err.message);
            }
        }

        res.json(dechets);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};



exports.getDechetAndUserByIdDechet = async (req, res) => {
    try {
        const id = req.params.id
        console.log("req param", req.params)
        console.log('id ====' ,id)
        const dechet = await dechetsModel.findDechetAndUserById(id)
        console.log('LE DECHET === ',dechet)
        if (!dechet) {
            return res.status(404).json({ error: 'Déchet non trouvé' });
        }
       // console.log(dechet)
        dechet.images = []
        if (!dechet.image_base64) {
            console.error(err);

        }
        const fullPath = path.join(__dirname, '..', dechet.image_base64)
        if (!fs.existsSync(fullPath)) {
            console.warn(`Fichier image non trouvé : ${fullPath}`);
        }

        const ext = path.extname(fullPath).substring(1);
        const base64 = fs.readFileSync(fullPath, { encoding: 'base64' });
        dechet.images.push(`data:image/${ext};base64,${base64}`);
     //   console.log(dechet)
        res.json(dechet);
    } catch (err) {

        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}
