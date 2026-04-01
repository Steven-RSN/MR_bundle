import { openDB } from "idb";

const DB_NAME = 'MarcheEtRamasseDB';
const DB_VERSION = 1;
const STORE = 'dechets_pending';
let dbPromise = null;

export function getDB() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE)) {
                    db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
                }
            }
        })
    }
    return dbPromise;
}
//CRUD:
//ajout des données du formulaire a la db
export async function saveDechetLocal(data) {
    const db = await getDB()
    const id = await db.add(STORE, data);
    return id;
}
//Récupère tout -> (liste d'objets)
export async function getAllDechetPending() {
    const db = await getDB();
    return db.getAll(STORE);
}

// Récupère un déchet local par son id
export async function getDechetById(id) {
    const db = await getDB();
    return db.get(STORE, id);
}

// Supprime un élément local par son id (après sync réussi)
export async function deletePending(id) {
    const db = await getDB();
    return db.delete(STORE, id);
}

//recupre un item de la db
export async function updateDechet(item) {
    const db = await getDB()
    return db.put(STORE, item)
}


// Vide tout !
export async function clearPending() {
    const db = await getDB();
    return db.clear(STORE);
}

