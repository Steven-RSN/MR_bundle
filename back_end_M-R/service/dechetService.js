const dechetsModel = require('../models/dechetModel');
const fs = require('fs');
const path = require('path');
const sanitize = require('../utils/utils');

exports.ajouterDechet = async (data) => {
    //Nettoyer les data
    const cleanData = {};
    for (const key in data) {
        if (key === 'images') {
            cleanData.images = Array.isArray(data.images) ? data.images : [];
        } else {
            cleanData[key] = sanitize(data[key]);
        }
    }

    // Compatibilite ascendante: accepte user_id mais normalise vers id_user.
    if (!cleanData.id_user && cleanData.user_id) {
        cleanData.id_user = cleanData.user_id;
    }

    // Validation:
    const required = [
        'commentaire',
        'lieu',
        'latitude',
        'longitude',
        'volume_litres',
        'poids_kg',
        'id_user'
    ];
    const isMissing = (value) => {
        return value === null
            || value === undefined
            || (typeof value === 'string' && value.trim().length === 0)
            || (Array.isArray(value) && value.length === 0);
    };

    const missing = required.filter(
        (k) => isMissing(cleanData[k])
    );

    if (missing.length) {
        throw {
            status: 400,
            payload: { success: false, message: 'Données manquantes', missing }
        };
    }
    const result = await dechetsModel.ajouterSignalement(cleanData);
    const dechetId = result.id_alertWaste;

    // gestion des images
    await saveImages(cleanData.images, dechetId);
    return { id: dechetId };
}

async function saveImages(images, dechetId) {
    if (!images || images.length === 0) return;

    const uploadDir = path.join(__dirname, '../uploads', `${dechetId}`);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (let i = 0; i < images.length; i++) {
        const base64Data = images[i].replace(/^data:image\/\w+;base64,/, '');
        const ext = images[i].match(/^data:image\/(\w+);base64,/)[1];
        const fileName = `img_${i}.${ext}`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, base64Data, 'base64');

        await dechetsModel.ajouterImage(
            dechetId,
            `/uploads/${dechetId}/${fileName}`
        );
    }
}