<template>
    <div v-if="dechet" class="flex justify-center mt-2">

        <div class=" bg-base-300 border-base-300 shadow-xl rounded-box border max-w-120 ">

            <div class="card bg-base-100 shadow-xl ">
                <div class="flex justify-center ">
                    <img :src="dechet.images[0]" alt="Shoes" class=" w-full object-cover rounded-t-xl" />
                </div>
                <div class="card-body">
                    <h2 class="card-title underline mt-[-8px]">
                        Déchet signalé : {{ dechet.lieu }}
                    </h2>

                    <div class="card-actions justify-between items-center mb-1">
                        <div class="flex justify-around ">
                            <div class="badge mr-2 badge-outline border-2 b-2-customGreen bg-customGreen ">
                                <p class="text-xs">{{ dechet.volume_litres }} Litres</p>
                            </div>
                            <div class="badge mx-4 badge-outline border-2 b-2-customGreen bg-customGreen">
                                <p class="text-xs">{{ dechet.poids_kg }} Kilos </p>
                            </div>
                        </div>
                        <!-- Pas de "Je ramasse" : le signalement n'est pas encore sur le serveur -->
                        <div class="border flex justify-between items-center rounded-lg bg-gray-200 border-2 border-gray-300 p-1.5 opacity-40 cursor-not-allowed">
                            <p class="ml-1 mr-1.5">Je ramasse</p>
                            <img src="/public/icons/autres/icons8-drapeau-100 3.png" class="mr-1" alt="Drapeau">
                        </div>
                    </div>

                    <div class="flex items-center mt-4">
                        <img src="/public/icons/profil/neom-0SUho_B0nus-unsplash 2.png"
                            class="w-12 h-12 object-cover rounded-full" alt="">
                        <div class="ml-3 ">
                            <h3 class="text-lg">{{ toUp(userStore.pseudo) }}</h3>
                            <p class="text-xs">Statut: Gardien des Montagnes</p>
                        </div>
                    </div>

                    <div class="flex items-center border-t border-gray-400 space-x-2 mt-4 pt-6 ">
                        <img src="/public/icons/form/icons8-calendrier-100 2.png" class="w-8" alt="">
                        <label class="label-s">{{ dechet.date_signalement }}</label>
                    </div>

                    <div class="flex items-center border-b border-t border-gray-400 space-x-2 mt-4 py-5">
                        <img src="/icons/form/iconsCom.png" class="w-7 mb-5.5 ml-1" alt="">
                        <label class="hidden">Description :</label>
                        <p class="flex-1 focus:outline-none">{{ dechet.commentaire }}</p>
                    </div>

                    <div class="flex justify-center mt-4 mb-2">
                        <button class="btn bg-customGreen b-2-customGreen" @click="$router.push('/local-dechets')">
                            ← Retour aux déchets locaux
                        </button>
                    </div>

                </div>
                <div class="flex items-center border-t-1 border-gray-400 space-x-2 mb-[-80px] ">
                    <div id="map" style="height: 396px;"></div>
                </div>
            </div>

        </div>

    </div>
</template>

<script setup lang="js">

import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getDechetById } from '../services/db'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { toUp } from '../tools/utils'
import { useUserStore } from '../stores/user'

const route = useRoute()
const dechet = ref(null)
const userStore = useUserStore()

onMounted(async () => {
    const id = Number(route.params.id)
    try {
        dechet.value = await getDechetById(id)

        await nextTick()
        const lat = dechet.value?.latitude ?? 43.6045
        const lng = dechet.value?.longitude ?? 1.444
        const map = L.map('map').setView([lat, lng], 12)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map)

        L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`<b>${dechet.value.lieu}</b>`)
            .openPopup()

    } catch (error) {
        console.error('Erreur récupération déchet local:', error)
        dechet.value = null
    }
})

</script>

<style scoped>
#map {
    width: 100%;
}
</style>
