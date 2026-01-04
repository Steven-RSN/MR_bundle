const dechetsModel = require('../models/dechetModel')
const fs = require('fs')
const path = require('path')

exports.ajoutDechet = async (req, res) => {
    try { 
        // Nettoyer toutes les données
        const cleanData = {};
        for (const key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                if (key === 'images') {
                    // ne pas nettoyer les images, juste s'assurer que c'est un tableau
                    cleanData[key] = Array.isArray(req.body[key]) ? req.body[key] : [];
                } else {
                    cleanData[key] = sanitize(req.body[key]);
                }
            }
        }
        const images = cleanData.images;
        
        //gestion data manquante
        const missing = [];
        for (const key in cleanData) {
            if (
                cleanData[key] === null ||
                cleanData[key] === undefined ||
                (typeof cleanData[key] === 'string' && cleanData[key].length === 0) ||
                (Array.isArray(cleanData[key]) && cleanData[key].length === 0)
            ){ missing.push(key);}
        }
        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Toutes les données sont obligatoires',
                missing
            });
        }

        const result = await dechetsModel.ajouterSignalement(cleanData);
        const dechetId = result.id_alertWaste;

        // Créer dossier uploads si inexistant 
        const uploadDir = path.join(__dirname, '../uploads', `${dechetId}`);
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        // Parcourir les images Base64
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
        const dechetsMap = {};
        console.log("les datas", dechetsData)
        for (const row of dechetsData) {
            if (!dechetsMap[row.id]) {
                dechetsMap[row.id] = {
                    id: row.id,
                    type_dechet: row.name,
                    commentaire: row.commentaire,
                    user_id: row.id_user,
                    volume_litres: row.volume_litres,
                    poids_kg: row.poids_kg,
                    lieu: row.lieu,
                    latitude: row.latitude,
                    longitude: row.longitude,
                    images: []
                };
            }
            // Si pas d'image, passe au suivant
            if (!row.path) {continue;}
            
            try {
                const fullPath = path.join(__dirname, '..', row.path);

                if (!fs.existsSync(fullPath)) {
                    console.warn(`Fichier image non trouvé : ${fullPath}`);
                    continue;
                }

                const ext = path.extname(fullPath).substring(1);
                const base64 = fs.readFileSync(fullPath, { encoding: 'base64' });
                const dataUri = `data:image/${ext};base64,${base64}`;
                dechetsMap[row.id].images.push(dataUri);

            } catch (err) {
                console.error("Erreur lecture image :", err.message);
            }
        }

        res.json(Object.values(dechetsMap));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};


exports.getDechetAndUserByIdDechet = async (req, res) => {
    try {
        const id = req.params.id
        console.log("req param", req.params)
        console.log('id ====', id)
        const dechet = await dechetsModel.findDechetAndUserById(id)
        console.log('LE DECHET === ', dechet)
        if (!dechet) {
            return res.status(404).json({ error: 'Déchet non trouvé' });
        }
        // console.log(dechet)
        dechet.images = []
        if (!dechet.image_path) {
            console.error(err);

        }
        const fullPath = path.join(__dirname, '..', dechet.image_path)
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
function sanitize(data) {
    if (typeof data !== 'string') return data;

    return data
        .trim()                     // équivalent trim()
        .replace(/<\/?[^>]+>/gi, '') // équivalent strip_tags()
        .replace(/\\/g, '');         // équivalent stripslashes()
}