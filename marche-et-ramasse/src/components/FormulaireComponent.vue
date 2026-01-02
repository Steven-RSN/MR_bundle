<!-- <template>
  <form @submit.prevent="enregistrer">
    <div>
      <label>Nom :</label>
      <input type="text" v-model="nom" required />
    </div>
    
    <div>
      <label>Type de déchet :</label>
      <select v-model="type" required>
        <option disabled value="">--Choisir un type--</option>
        <option>Plastique</option>
        <option>Verre</option>
        <option>Papier</option>
        <option>Metal</option>
        <option>Autre</option>
      </select>
    </div>
    
    <div>
      <label>Quantité :</label>
      <input type="number" v-model="quantite" min="1" required />
    </div>
    
    <div>
      <label>Volume estimé (L) :</label>
      <input type="number" v-model="volume" min="0" step="0.1" required />
    </div>
    
    <div>
      <label>Poids estimé (kg) :</label>
      <input type="number" v-model="poids" min="0" step="0.1" required />
    </div>
    
    <div>
      <label>Lieu :</label>
      <input type="text" v-model="lieu" required />
    </div>
    
    <div>
      <label>Commentaire :</label>
      <textarea v-model="commentaire"></textarea>
    </div>
    
    <button type="submit" class="btn bg-customGreen">Ajouter le déchet</button>
  </form>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { openDB } from 'idb'

const nom = ref('')
const type = ref('')
const quantite = ref(1)
const volume = ref(0)   // volume estimé en litres
const poids = ref(0)    // poids estimé en kg
const lieu = ref('')
const commentaire = ref('')

let db
onMounted(async () => {
  db = await openDB('MarcheEtRamasseDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('formulaire')) {
        db.createObjectStore('formulaire', { keyPath: 'id', autoIncrement: true })
      }
    }
  })
})

async function enregistrer() {
  const data = {
    nom: nom.value,
    type: type.value,
    quantite: quantite.value,
    volume: volume.value,
    poids: poids.value,
    lieu: lieu.value,
    commentaire: commentaire.value,
    date: new Date(),
    sync: false  // savoir si l'entrée a été synchronisée
  }
  
  await db.add('formulaire', data)

  console.log('déchet ajouté localement !')
  
  // Réinitialiser le formulaire
  nom.value = ''
  type.value = ''
  quantite.value = 1
  volume.value = 0
  poids.value = 0
  lieu.value = ''
  commentaire.value = ''
  
}

</script>

<style scoped>
form { display: flex; flex-direction: column; gap: 10px; max-width: 400px; }
label { font-weight: bold; }
input, select, textarea { width: 100%; padding: 5px; }
button:hover { background-color: #369870; }
</style> -->
