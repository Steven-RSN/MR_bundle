<template>
    <div class="flex justify-center mt-8">
        <div class="bg-base-300 border-base-300 shadow-xl rounded-box mx-auto border p-6">
            <h1 class="tracking-wide text-center text-3xl m-4 border-b-2 border-t-2 rounded-lg b-customGreen p-4">
                Mon compte
            </h1>

            <div class="flex items-center my-6">
                <img src="/icons/profil/neom-0SUho_B0nus-unsplash 2.png"
                    class="w-16 h-16 object-cover rounded-full" alt="">
                <div class="ml-3">
                    <h3 class="text-lg">{{ profilUser.pseudo || 'Bernard' }}</h3>
                    <p class="text-xs">Statut: Gardien des Montagnes</p>
                </div>
            </div>


            <details class="border-b border-t border-gray-400 py-2">
                <summary class="flex items-center space-x-4">
                    <!-- Image à gauche -->
                    <img src="/icons/form/icons8-account-100.png" class="w-8" alt="Icone de compte">
                    <!-- Texte à droite de l'image -->
                    <span>Mes Informations</span>
                </summary>
                <div class="mt-2 ml-2 space-y-1">
                    <p><strong>Pseudo :</strong> {{ profilUser.pseudo }}</p>
                    <p><strong>Âge :</strong> 28 ans</p>
                    <p><strong>Email :</strong> {{ profilUser.email }}</p>
                    <p><strong>Badge :</strong> Gardien des Montagnes</p>
                </div>
            </details>

            <details class="border-b border-gray-400 py-2">
                <summary class="flex items-center space-x-4">

                    <img src="/icons/profil/icons8-badge-100.png" class="w-8" alt="Icone de compte">

                    <span>Mes Badges</span>
                </summary>
                <div class="infos">
                    <!-- lister les badge  -->

                </div>
            </details>

            <details class="border-b border-gray-400 py-2 ">
                <summary class="flex items-center space-x-4">

                    <img src="/icons/profil/icons8-historique-100.png" class="w-8" alt="Icone de compte">

                    <span>Mon Historique</span>
                </summary>
                <!-- 🖥️ TABLEAU sur écran moyen/grand -->
                <div v-if="dechetUser.length && dechetUser[0].length > 0" class="hidden md:block mt-4 ">
                    <table class="table table-zebra table-xs text-sm">
                        <caption class="text-base font-semibold bg-customGreen text-primary-content p-2 rounded-t-lg">
                            Mes alertes
                        </caption>
                        <thead>
                            <tr>
                                <th>Lieu</th>
                                <th>Type</th>
                                <th>Coordonnées</th>
                                <th>Poids</th>
                                <th>Volume</th>
                                <th>Ramassé</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(dechet, index) in dechetUser[0]" :key="index">
                                <td>{{ dechet.lieu }}</td>
                                <td>{{ dechet.type_dechet }}</td>
                                <td>{{ dechet.longitude }} / {{ dechet.latitude }}</td>
                                <td>{{ dechet.poids_kg }}</td>
                                <td>{{ dechet.volume_litres }}</td>
                                <td>
                                    <span
                                        :class="dechet.ramassé ? 'badge badge-success badge-sm' : 'badge badge-warning badge-sm'">
                                        {{ dechet.ramassé ? 'Oui' : 'Non' }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else>
                    <p>
                        Aucun déchet ajouté
                    </p>
                </div>

                <!-- CARTES sur mobile -->
                <div v-if="dechetUser.length && dechetUser[0].length > 0" class=" mt-4">
                    <div v-for="(dechet, index) in dechetUser[0]" :key="index"
                        class="card bg-base-200 shadow-xl p-2 rounded-lg my-2">
                        <h3 class="font-semibold text-base text-green-800">
                            {{ dechet.lieu }} — {{ dechet.type_dechet }}
                        </h3>
                        <p class="text-sm text-gray-600">
                            <b>Coordonnées :</b> {{ dechet.longitude }} - {{ dechet.latitude }}
                        </p>

                        <div class="card-actions justify-between items-center my-1">
                            <div class="flex justify-around ">

                                <div class="badge mr-2 badge-outline border-1 b-2-customGreen bg-customGreen ">
                                    <p class="text-xs">{{ dechet.volume_litres }} Litres</p>
                                </div>
                                <div class="badge badge-outline border-1 b-2-customGreen bg-customGreen">
                                    <p class="text-xs">{{ dechet.poids_kg }} Kilos </p>
                                </div>

                            </div>
                            <span
                                :class="dechet.ramassé ? 'badge badge-success text-xs ' : 'badge badge-warning text-xs'">
                                {{ dechet.ramassé ? 'Ramassé' : 'En attente' }}
                            </span>

                        </div>

                    </div>
                </div>
            </details>


            <details>
                <summary>Autre</summary>
                <div class="infos">
                    <p>Musique, Voyage, Programmation</p>
                </div>
            </details>


        </div>
        
    </div>
</template>

<script setup lang="js">
import { ref, onMounted } from 'vue'
import { getProfilUserById } from '../services/api'
import { useUserStore } from '../stores/user'
const userStore = useUserStore()
let profilUser = ref({})
let dechetUser = ref([])


onMounted(async () => {

    console.log('test', userStore.id)
    profilUser.value = {
        pseudo: userStore.pseudo,
        email: userStore.email
    }
    const res = await getProfilUserById(userStore.id)
    console.log('profiluser', profilUser)
    if (!res) {
        console.log('Probleme - !!!! -')
    } else {
        if (dechetUser[0] != null) {
            dechetUser = res
            console.log(dechetUser[0].length)
        }

    }

})


</script>
