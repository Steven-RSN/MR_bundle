<template>
  <div class="flex justify-center">
    <fieldset class=" bg-base-200 border-base-300 shadow-xl rounded-box mx-auto border p-2 ">
      <h1 class="tracking-wide text-center text-2xl m-4 border-b-2 border-t-2 rounded-lg b-customGreen p-4 ">
        Signaler un déchet
      </h1>

      <form @submit.prevent="enregistrer">

        <!-- zone pour les images -->
        <div class="mx-8 mt-5 border-2 border-dashed border-gray-400 rounded-lg p-6 text-center 
          cursor-pointer bg-gray-200 hover:bg-gray-100" @click="handleImageClick" @dragover.prevent
          @drop.prevent="handleDrop">

          <label>Images</label>
          <p class="text-gray-600">
            Glissez-déposez vos images ici<br />ou cliquez pour sélectionner (max 3)
          </p>

          <input ref="fileInput" type="file" accept="image/*" multiple class="hidden"
            :capture="useCamera ? 'environment' : null" @change="handleFiles" />
          <p v-if="errors.images" class="text-red-600 text-sm mt-2">{{ errors.images }}</p>
        </div>

        <!-- preview de l'image s'il y en a: -->
        <div v-if="images.length" class=" flex justify-center mt-2 flex space-x-2  ">

          <div v-for="(img, index) in images" :key="index" class="w-20 h-20 overflow-hidden relative ">
            <img class="w-full h-full object-cover rounded-lg border-2 border-gray-400 " :src="objectUrl(img)"
              alt="Preview-image" />

            <button type="button" class="absolute top-0 right-0 btn btn-error text-white text-x h-6 w-6 p-1"
              @click="removeImage(index)"> ✕ </button>
          </div>

        </div>

        <!-- / <p v-if="gps.latitude && gps.longitude">Géolocalisation: {{ gps.latitude }}/{{gps.longitude }}</p> -->

        <!-- section input lieu -->
        <div class=" flex items-center border-t border-gray-400 space-x-2 mt-6 pt-6 ">
          <img src="/icons/form/iconsPosition.png" class="w-8" alt="">
          <label class="label-s" for="lieu">Lieu</label>
          <input class="flex-1 text-right focus:outline-none" id="lieu" type="text" v-model="lieu" required />
        </div>
        <p v-if="errors.lieu" class="text-red-600 text-sm ml-2">{{ errors.lieu }}</p>

        <!-- section drop liste type de déchet -->
        <div class="flex items-center border-t border-gray-400 space-x-2 mt-4 pt-5">
          <img src="/icons/form/icons8-search-100.png" class="w-7 ml-1" alt="">
          <label class="label-s">Type de déchet</label>
          <select class="flex-1 mr-2 focus:outline-none" v-model="type" required>
            <option class="text-right" disabled value=""> Type </option>
            <option class="text-center" value="autre"> Autre </option>
            <option class="text-center" value="plastique">Plastique</option>
            <option class="text-center" value="verre">Verre</option>
            <option class="text-center" value="papier">Papier</option>
            <option class="text-center" value="metal">Metal</option>
          </select>
        </div>
        <p v-if="errors.type" class="text-red-600 text-sm ml-2">{{ errors.type }}</p>

        <!-- section input volume -->
        <div class="flex items-center border-t border-gray-400 space-x-2 mt-4 pt-5">
          <img src="/icons/form/icons8-poubelle.png" class="w-6.5 ml-1 pb-0.5" alt="">
          <label class="label-s" for="volume">Volume estimé</label>
          <input class="flex-1 text-right focus:outline-none" id="volume" type="number" v-model="volume" min="0"
            step="0.1" required /><span class="mr-3 font-semibold">L</span>
        </div>
        <p v-if="errors.volume" class="text-red-600 text-sm ml-2">{{ errors.volume }}</p>

        <!-- section input poids -->
        <div class="flex items-center border-t border-gray-400 space-x-2 mt-4 pt-5">
          <img src="/icons/form/iconPoid.png" class="w-8" alt="">
          <label class="label-s" for="poids">Poids estimé</label>
          <input class="flex-1 text-right focus:outline-none" id="poids" type="number" v-model="poids" min="0"
            step="0.1" required /><span class="mr-2 font-semibold">kg</span>
        </div>
        <p v-if="errors.poids" class="text-red-600 text-sm ml-2">{{ errors.poids }}</p>


        <!-- section input description -->
        <div class="flex items-center border-b border-t border-gray-400 space-x-2 mt-4 py-5">
          <img src="/icons/form/iconsCom.png" class="w-7 mb-5.5 ml-1" alt="">
          <label class="hidden">Description :</label>
          <textarea class="flex-1 focus:outline-none" placeholder="Description.." v-model="commentaire"></textarea>
        </div>
        <p v-if="errors.commentaire" class="text-red-600 text-sm ml-2">{{ errors.commentaire }}</p>

        <button class="self-center btn btn-custom shadow-lg hover:shadow-xl m-5" type="submit">Ajouter le
          déchet</button>

      </form>

    </fieldset>


  </div>

  <!-- message "modal" -->
  <div v-if="message" class="fixed inset-0 flex items-center justify-center z-50">
    <div class="absolute inset-0 bg-black/40"></div>

    <div class="grid relative rounded-lg shadow-xl px-12  py-4 border-4 border-gray-300 text-lg"
      :class="messageType === 'success' ? 'bg-green-100 text-green-900 ' : 'bg-red-100 text-red-800'">
      {{ message }}

      <button @click="redirect()" class=" btn mt-12"
        :class="messageType === 'success' ? 'btn btn-success' : 'btn btn-error'">
        OK
      </button>
    </div>
  </div>



</template>




<script setup lang="js">

import { ref, onMounted } from 'vue'
import { saveDechetLocal } from '../services/db'
import { sendDechetToServer } from '../services/api'
//import { syncPending } from '../services/syncService'
import router from '../router'
//import { fileToBase64 } from '../services/image'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

// Initialisation des données/variables du formulaire
const type = ref('')
const volume = ref(0)
const poids = ref(0)
const lieu = ref('')
const commentaire = ref('')
const fileInput = ref(null)
const images = ref([])
const message = ref('')
const messageType = ref('')
const useCamera = ref(false)
const gps = ref({ latitude: null, longitude: null })
const errors = ref({});

onMounted(() => {
  // si l'écran est inférieur a 768px, on considère comme mobile !
  useCamera.value = window.innerWidth < 768

});

// Ouvrel'appareil photo
function handleImageClick() {
  fileInput.value.click();
}

// handleFiles pour gérer les img
async function handleFiles(event) {
  const files = Array.from(event.target.files)
  console.log('Fichiers sélectionnés:', files)

  if (images.value.length + files.length > 3) {
    errors.value.images = "- Maximum 3 images autorisées. -"
    return
  }
  const maxVolume = 5 * 1024 * 1024; // 5 Mo
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      errors.value.images = "Seuls les fichiers images sont autorisés.";
      continue;
    }
    if (file.size > maxVolume) {
      errors.value.images = "Image trop volumineuse (max 5 Mo).";
      continue;
    }
    images.value.push(file);
  }
  if (!gps.value.latitude || !gps.value.longitude) {
    checkGelocaltion();
  }
}


function checkGelocaltion() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        gps.value.latitude = pos.coords.latitude;
        gps.value.longitude = pos.coords.longitude;
      },
      (err) => {
        console.warn("Géoloc impossible:", err);
        gps.value.latitude = null;
        gps.value.longitude = null;
        message.value = "Activez la géolocalisation pour pouvoir signaler un déchet.";
        messageType.value = "error";
      },
      { enableHighAccuracy: true }
    );
  } else {
    message.value = "La géolocalisation n'est pas disponible .";
    messageType.value = "error";
  }
}

// Fonction qui génère l'URL
function objectUrl(file) {
  return URL.createObjectURL(file)
}


// Fonction pour supprimer des images
function removeImage(index) {
  images.value.splice(index, 1)
}

function convert64(files) {
  return Promise.all(
    files.map(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result); // Data URL
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    }))
  );

}
// Fonction pour ajouter des images
async function enregistrer() {
  if (!gps.value.latitude || !gps.value.longitude) {
    message.value = "Impossible d'envoyer le signalement sans géolocalisation.";
    messageType.value = "error";
    return;
  }
  if (!userStore.id) {
    message.value = 'Vous devez être connecté pour poster un signalement.'
    messageType.value = 'error'
    return
  }
  console.log('iduser', userStore.id)

  //Préparation des données
  let imgConvert = []
  try {
    imgConvert = await convert64(images.value)
    console.log("après conversion", imgConvert)

  } catch (err) {
    console.error('Erreur conversion images:', err)
    message.value = 'Erreur lors du traitement des images.'
    messageType.value = 'error'
    return
  }

  const data = {
    id_user: userStore.id,
    type_dechet: type.value,
    volume_litres: volume.value,
    poids_kg: poids.value,
    lieu: lieu.value.trim(),
    commentaire: commentaire.value.trim(),
    latitude: gps.value.latitude,
    longitude: gps.value.longitude,
    images: [...imgConvert],
    date_signalement: new Date().toLocaleDateString('fr-FR')
  };
  if (!validerData(data)) { return }

  //tentative d'envoi au backend
  try {
    if (!navigator.onLine) { throw new Error('offline') }

    const res = await sendDechetToServer(data)
    if (res?.success) {
      message.value = 'Les données ont été enregistrées !'
      messageType.value = 'success'
      resetForm()
      return
    }
    // probleme backend
    throw new Error('backend-error')

  } catch (e) {
    const status = e?.response?.status ?? e?.status ?? null
    const backendMessage = e?.response?.data?.message

    // Erreur d'auth: on informe l'utilisateur, pas de sauvegarde locale trompeuse.
    if (status === 401) {
      message.value = 'Vous devez être connecté pour poster une alerte.'
      messageType.value = 'error'
      return
    }

    // Erreur de validation/metier: afficher l'erreur backend reelle.
    if (status === 400 || status === 409) {
      message.value = backendMessage || 'Données invalides, vérifiez le formulaire.'
      messageType.value = 'error'
      return
    }

    const canFallbackLocally = !navigator.onLine || e?.message === 'offline' || !e?.response || status >= 500
    if (!canFallbackLocally) {
      message.value = backendMessage || 'Erreur lors de l\'envoi du signalement.'
      messageType.value = 'error'
      return
    }

    try {
      //sauvegarde locale
      console.log('Hors ligne, sauvegarde locale...')
      const id = await saveDechetLocal(data);
      console.log('Enregistré localement avec id:', id)
      console.log('dechet :', data)
      message.value = 'Hors ligne ou serveur indisponible — enregistré localement.'
      messageType.value = 'error';

    } catch (e) {
      console.error('Erreur IndexedDB:', e)
      message.value = 'Erreur lors de la sauvegarde locale.'
      messageType.value = 'error'
    }

  }
}


function validerData(data) {
  errors.value = {} // Reset erreurs

  let valid = true
  if (data.images.length === 0) {
    errors.value.images = "* Veuillez ajouter au moins une image."
    valid = false
  }
  if (isNaN(poids.value) || poids.value <= 0) {
    errors.value.poids = "* Le poids doit être supérieur à 0."
    valid = false
  }
  if (isNaN(volume.value) || volume.value <= 0) {
    errors.value.volume = "* Le volume doit être supérieur à 0."
    valid = false
  }
  if (!lieu.value || lieu.value.length < 3) {
    errors.value.lieu = "* Le lieu doit contenir au moins 3 caractères."
    valid = false
  }
  if (!commentaire.value || commentaire.value.length < 10) {
    errors.value.commentaire = "* La description doit contenir au moins 10 caractères."
    valid = false
  }
  if (!type.value) {
    errors.value.type = "* Veuillez choisir un type de déchet."
    valid = false
  }
  if (!valid) {
    console.log("-> Validation échouée:", errors.value)
  }
  return valid
}

function resetForm() {
  //reset form
  images.value = []
  fileInput.value.value = null
  type.value = ''
  volume.value = 0
  poids.value = 0
  lieu.value = ''
  commentaire.value = ''
}

// Fonction de redirection
function redirect() {
  router.push({
    path: '/'
  })
}


/*
// Ajout des images via drag and drop
function handleDrop(event) {
  addFiles(Array.from(event.dataTransfer.files))
}
*/
</script>


<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 500px;
}

label {
  font-weight: bold;
}

input,
select {
  width: 100%;
  padding: 4.5px;
}

.btn-custom {
  width: 142px;
  padding: 5px;
  background-color: #fceac8;
  cursor: pointer;
}

button:hover {
  background-color: #fce6ba;
}
</style>

/*
async function checkGeolocationt() {
if (!navigator.geolocation) {
message.value = "La géolocalisation n'est pas disponible sur votre appareil.";
messageType.value = "error";
return false;
}
return new Promise((resolve) => {
navigator.geolocation.getCurrentPosition(
(position) => {
gps.value.latitude = position.coords.latitude;
gps.value.longitude = position.coords.longitude;
resolve(true);
},
(err) => {
console.log("Géolocalisation non autorisée/erreur", err);
message.value = "Pour signaler un déchet, veuillez activer la géolocalisation.";
messageType.value = "error";
gps.value.latitude = null;
gps.value.longitude = null;
resolve(false);
},
{ enableHighAccuracy: true }
);
});
}
*/
