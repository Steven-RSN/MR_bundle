<template>
    <div v-if="dechet" class="flex justify-center mt-2   ">

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
                        <div @click="saveToClean(dechet.id)" class="border cursor-pointer transition rounded-lg p-1.5"
                            :class="userStore.isToClean(dechet.id) ? 'bg-customGreen border-0 p-2' : 'bg-gray-100'">
                            <img src="/public/icons/autres/icons8-drapeau-100 3.png" alt="Drapeau">
                        </div>

                    </div>

                    <div class="flex items-center mt-4">

                        <img src="/public/icons/profil/neom-0SUho_B0nus-unsplash 2.png"
                            class="w-12 h-12 object-cover rounded-full<" alt="">
                        <div class="ml-3 ">
                            <h3 class="text-lg">{{ toUp(dechet.pseudo) }}</h3>
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

                </div>
                <div class="flex items-center border-b border-t-1 border-gray-400 space-x-2 ">
                    <div id="map" style="height: 400px;"></div>
                </div>
            </div>

        </div>

    </div>
</template>

<script setup lang="js">

import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getDechetAndUserByIdDechet } from '../services/api'
import L from "leaflet"
import 'leaflet/dist/leaflet.css'
import { truncateText, toUp } from '../tools/utils'
import { useUserStore } from '../stores/user'
const maps = ref({})
const route = useRoute()
const dechet = ref(null)
const userStore = useUserStore()

onMounted(async () => {

    const id = route.params.id
    try {
        dechet.value = await getDechetAndUserByIdDechet(id)
        console.log(dechet.value)

        await nextTick()

        let zoomLevel = 12
        const map = L.map('map').setView([dechet.value.latitude, dechet.value.longitude], zoomLevel);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map)

        L.marker([dechet.value.latitude, dechet.value.longitude])
            .addTo(map)
            .bindPopup(`<b>${dechet.value.lieu}</b>`)
            .openPopup()

    } catch (error) {
        console.error('Erreur récupération déchet:', error)
        dechet.value = null
    }

})

function saveToClean(dechetID) {
  userStore.setClean(dechetID)
}

</script>

<style scoped>
#map {
    width: 100%;
}
</style>
