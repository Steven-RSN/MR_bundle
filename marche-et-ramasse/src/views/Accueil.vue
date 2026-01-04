<template>
    <div class="bg-beigeCustome px-3 p-1">
        <p class="text-center text-xs"> Ici, tu peux référencer les déchets rencontrés en randonnée et
            encourager une communauté de randonneurs responsables.</p>

    </div>

    <div class="flex justify-center mt-5">

        <div class=" bg-base-300 border-base-300 shadow-xl rounded-box mx-auto border p-6 ">
            <h1 class=" tracking-wide text-center text-xl mb-6 border-b-2 border-t-2 rounded-lg b-customGreen p-2 ">
                Bienvenue sur <span style="display: block; ;">Marche & Ramasse</span>
            </h1>
            <div class="max-w-md  mb-6 mx-auto">
                <label for="search" class="sr-only">Rechercher</label>
                <!-- la barre de recherche  -->
                <div class="relative">
                    <input type="search" placeholder="Rechercher un lieu..." class="w-full rounded-lg border border-gray-400 bg-white py-2 pl-10 pr-5 text-sm text-gray-900 
                       focus:outline-none" />
                    <svg class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 "
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-4.35-4.35m1.85-5.65a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
                    </svg>
                </div>
            </div>

            <div v-for="dechet in dechets" :key="dechet.id"
                class="card  border-4 border-gray-100 bg-base-100 w-65 shadow-xl mx-auto mb-12 cursor-pointer hover:shadow-2xl transition "
                @click="goToFiche(dechet)"><!--Rajouter=> (dechet.id)-->
                <figure class="h-45">
                    <img :src="dechet.images" class="w-full h-full object-cover" alt="Shoes" />
                </figure>
                <div class="card-body mx-[-12px] mb-[-8px]">
                    <h2 class="text-lg underline mt-[-17px] ">
                        <!-- Dechet signalé : Lac d’Oô-->
                        Dechet signalé : {{ truncateText(dechet.lieu, 18) }}
                    </h2>

                    <div class="card-actions justify-between items-center mb-1">
                        <div class="flex justify-around ">

                            <div class="badge mr-2 badge-outline border-1 b-2-customGreen bg-customGreen ">
                                <p class="text-xs">{{ dechet.volume_litres }} Litres</p>
                            </div>
                            <div class="badge mx-2 badge-outline border-1 b-2-customGreen bg-customGreen">
                                <p class="text-xs">{{ dechet.poids_kg }} Kilos </p>
                            </div>

                        </div>
                        <div class="border cursor-pointer transition rounded-lg p-1 "
                            :class="userStore.isToClean(dechet.id) ? 'bg-customGreen border-0 p-1' : 'bg-gray-100'">
                            <img src="/public/icons/autres/icons8-drapeau-100 3.png" alt="Drapeau">
                        </div>
                    </div>
                    <div class="flex items-center border-t border-gray-300 space-x-2 mt-1 pt-2">

                        <p class="commentaire">{{ truncateText(dechet.commentaire, 156) }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>




<script setup lang='js'>
import { useRouter } from 'vue-router'
import { onMounted, ref, nextTick } from 'vue'
import { getAllDechets } from '../services/api'
import { truncateText } from '../tools/utils'
import { useUserStore } from '../stores/user'
import L from "leaflet"
const router = useRouter()
const dechets = ref([])
const userStore = useUserStore()


onMounted(async () => {
    try {
        const response = await getAllDechets();
        // console.log('donnees  backend:', dechets);
        dechets.value = response
        console.log('donnees  backend2:', dechets);

    } catch (err) {
        console.error('Erreur lors de la récupération des déchets:', err);
    }

});

// const props = defineProps({
//     id: Number,
//     nom: String,
//     description: String,
//     image: String
// })

function goToFiche(dechet) {
    router.push(
        {
            name: 'FicheDechet',
            params: { id: dechet.id },
            state: { dechet },
        })
}



</script>
<style>
.commentaire {
    white-space: pre-wrap;
    /* conserve les retours à la ligne */
    overflow-wrap: break-word;
    /* coupe les mots trop longs */
    word-break: break-word;
    /* sécurité pour certains navigateurs */
    max-width: 100%;
    /* ne dépasse pas la largeur de la card */
    max-height: 6em;
    /* optionnel : limite la hauteur de la card */
    overflow: hidden;
    /* coupe le texte si trop long */
    text-overflow: ellipsis;
    /* ajoute "..." si le texte est tronqué */
}
</style>
