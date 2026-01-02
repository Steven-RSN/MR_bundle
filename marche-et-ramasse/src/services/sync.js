// getAllDechetPending() → récupère tous les déchets stockés localement et pas encore synchronisés
// deletePending(id) → supprime un déchet local après qu'il ait été envoyé au backend
import { getAllDechetPending, deletePending } from './db';

// Fonction pour envoyer un élément au back
async function sendItemToServer(item) {
  const res = await fetch('http://localhost:3000/dechets', {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(item) 
  });
  // vérifie si le backend et ok
  if (!res.ok) {
    // récupère l'erreur
    const text = await res.text().catch(() => null);
    throw new Error(`Server responded ${res.status} ${text || ''}`);
  }
  //Lit la réponse JSON et on la retourne
  const data = await res.json();
  return data;
}

// Fonction  qui synchronise tous les déchets avec le backend
export async function syncPending() {
  // Vérifie si l'utilisateur est en ligne
  const online = navigator.onLine 
  if (!online) return { ok: false, reason: 'offline' }; //Si hors ligne on sort

  // Récupère tous les déchets stockés localement et en attente de sync
  const pending = await getAllDechetPending();
  
  if (!pending || pending.length === 0) return { ok: true, synced: 0 }// Si rien n'est à synchroniser
  let synced = 0;

  // Boucle sur les déchets
  for (const item of pending) {
    try {
      // Envoi le dechet au backend
      await sendItemToServer(item);
      // Supprime de la DB locale
      await deletePending(item.id); 

      synced++;
    } catch (err) {
      console.error('Échec de sync item id', item.id, err);
    }
  }
  return { ok: true, synced };
}
