<template>
  <div class="flex justify-center mt-8">
    <div class="bg-base-300 border-base-300 shadow-xl rounded-box mx-auto border p-6 w-full max-w-4xl">

      <!-- Titre -->
      <h1 class="tracking-wide text-center text-xl mb-6 border-b-2 border-t-2 rounded-lg b-customGreen p-2">
        Mes signalements locaux
      </h1>

      <!-- Boutons globaux -->
      <div class="flex justify-center gap-4 mb-8" v-if="dechets.length">
        <button class="btn bg-customGreen b-2-customGreen" @click="syncAll" :disabled="syncAllLoading">
          {{ syncAllLoading ? 'Synchronisation...' : 'Synchroniser tous' }}
        </button>

        <button class="btn btn-error btn-outline" @click="showConfirmClear = true">
          Vider tout
        </button>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="text-center py-10">
        Chargement...
      </div>

      <!-- Aucun déchet -->
      <div v-else-if="dechets.length === 0" class="text-center py-10 text-gray-500">
        Aucun signalement local en attente.
      </div>

      <!-- LISTE DES DÉCHETS LOCAUX -->
      <div
        v-else
        v-for="dechet in dechets"
        :key="dechet.id"
        class="card border-1 b-3-customGreen bg-base-100 w-70 shadow-xl mx-auto mb-12 transition hover:shadow-2xl cursor-pointer"
        @click="$router.push('/fiche-locale/' + dechet.id)"
      >
        <!-- Image -->
        <figure class="h-45" v-if="dechet.images?.length">
          <img :src="dechet.images[0]" class="w-full h-full object-cover" />
        </figure>

        <div class="card-body mx-[-12px] mb-[-8px]">
          <h2 class="text-lg underline mt-[-17px]">
            Déchet signalé : {{ truncateText(dechet.lieu, 18) }}
          </h2>

          <!-- Badges -->
          <div class="card-actions justify-between items-center mb-1">
            <div class="flex justify-around">
              <div class="badge mr-2 badge-outline border-1 b-2-customGreen bg-customGreen">
                <p class="text-xs">{{ dechet.volume_litres }} Litres</p>
              </div>
              <div class="badge mx-2 badge-outline border-1 b-2-customGreen bg-customGreen">
                <p class="text-xs">{{ dechet.poids_kg }} Kilos</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button
                class="btn btn-success btn-xs"
                @click.stop="syncDechet(dechet)"
                :disabled="syncing[dechet.id]"
              >
                {{ syncing[dechet.id] ? 'Envoi…' : 'Sync' }}
              </button>

              <button
                class="btn btn-error btn-xs"
                @click.stop="deleteDechetLocal(dechet.id)"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Commentaire -->
          <div class="flex items-center border-t border-gray-300 space-x-2 mt-1 pt-2">
            <p class="commentaire">
              {{ truncateText(dechet.commentaire, 156) }}
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- MODAL CONFIRMATION VIDAGE -->
  <div v-if="showConfirmClear" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="absolute inset-0 bg-black/40"></div>

    <div class="bg-white rounded-lg shadow-xl p-6 max-w-md">
      <h3 class="text-lg font-bold mb-4 text-red-600">
        Supprimer tous les signalements locaux ?
      </h3>
      <p class="mb-6 text-gray-700">
        Cette action est irréversible.
      </p>

      <div class="flex justify-end gap-3">
        <button class="btn btn-ghost" @click="showConfirmClear = false">
          Annuler
        </button>
        <button class="btn btn-error" @click="clearAllDechets">
          Supprimer tout
        </button>
      </div>
    </div>
  </div>

  <!-- MESSAGE -->
  <div v-if="message" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="absolute inset-0 bg-black/40"></div>
    <div class="bg-white rounded-lg shadow-xl p-6">
      <p class="mb-4">{{ message }}</p>
      <button class="btn btn-primary" @click="message = ''">OK</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAllDechetPending, deletePending, clearPending } from '../services/db'
import { sendDechetToServer } from '../services/api'
import { truncateText } from '../tools/utils'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const dechets = ref([])
const loading = ref(true)
const syncing = reactive({})
const syncAllLoading = ref(false)
const message = ref('')
const showConfirmClear = ref(false)

onMounted(loadDechets)

async function loadDechets() {
  loading.value = true
  dechets.value = await getAllDechetPending()
  loading.value = false
}

async function syncDechet(dechet) {
  if (!userStore.id || !userStore.token) {
    message.value = "Vous devez être connecté pour synchroniser."
    return
  }

  syncing[dechet.id] = true
  try {
    const res = await sendDechetToServer({ ...dechet, idUser: userStore.id })
    if (res?.success) {
      await deletePending(dechet.id)
      await loadDechets()
      message.value = "Déchet synchronisé avec succès ✔️"
    }
  } catch (err) {
    console.error(err)
    message.value = "Erreur lors de la synchronisation."
  } finally {
    syncing[dechet.id] = false
  }
}

async function syncAll() {
  if (!userStore.id || !userStore.token) {
    message.value = "Vous devez être connecté."
    return
  }

  syncAllLoading.value = true

  for (const dechet of [...dechets.value]) {
    syncing[dechet.id] = true
    try {
      const res = await sendDechetToServer({ ...dechet, idUser: userStore.id })
      if (res?.success) {
        await deletePending(dechet.id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      syncing[dechet.id] = false
    }
  }

  await loadDechets()
  syncAllLoading.value = false
  message.value = "Synchronisation terminée ✔️"
}

async function deleteDechetLocal(id) {
  await deletePending(id)
  await loadDechets()
}

async function clearAllDechets() {
  await clearPending()
  await loadDechets()
  showConfirmClear.value = false
  message.value = "Tous les signalements locaux ont été supprimés."
}


</script>

<style scoped>
.commentaire {
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
  max-height: 6em;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
