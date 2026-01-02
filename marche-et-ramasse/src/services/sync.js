import { getAllDechetPending, deletePending } from './db';



// petit helper pour tester la connectivité réelle (navigator.onLine n'est pas opti)
async function pingServer() {
  // try {
  //   const res = await fetch('http://localhost:3000/ping', { method: 'GET', cache: 'no-store' });
  //   return res.ok;
  // } catch (e) {
  //   return false;
  // }
}

async function sendItemToServer(item) {
  // envoie via fetch (ton backend doit accepter le JSON avec images base64)
  const res = await fetch('http://localhost:3000/dechets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(`Server responded ${res.status} ${text || ''}`);
  }
  const data = await res.json();
  return data;
}

export async function syncPending() {
  // vérifier que le serveur est joignable
  const online = navigator.onLine //&& await pingServer();
  if (!online) return { ok: false, reason: 'offline' };

  const pending = await getAllDechetPending();
  if (!pending || pending.length === 0) return { ok: true, synced: 0 };

  let synced = 0;
  for (const item of pending) {
    try {
      await sendItemToServer(item);
      await deletePending(item.id); // supprime local si réussi
      synced++;
    } catch (err) {
      console.error('Échec de sync item id', item.id, err);
      // ne pas throw : on continue pour les autres !!
    }
  }

  return { ok: true, synced };
}





// export async function syncWithServer() {
//     const allData = await getDechets()
//     const unsynced = allData.filter(d => !d.sync)

//     for (const item of unsynced) {
//         try {
//             const response = await sendDechetToServer(item)
//             if (response.ok) {
//                 item.sync = true
//                 await updateDechet(item)
//             }
//         } catch (e) {
//             console.error('Erreur de synchro :', e)
//         }
//     }
// }