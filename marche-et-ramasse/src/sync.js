import { openDB } from 'idb'

export async function syncWithServer() {
  const db = await openDB('MarcheEtRamasseDB', 1)
  const unsynced = await db.getAllFromIndex('formulaire', 'sync', false)

  for (const item of unsynced) {
    try {
      //envoi vers une API REST avec fetch
      const response = await fetch('https://monserveur.com/api/dechets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })

      if (response.ok) {
        item.sync = true
        await db.put('formulaire', item) // marque comme synchronisé
      }
    } catch (err) {
      console.error('Erreur de synchronisation :', err)
    }
  }
}
