<!-- <template>
  <div>
    <h1>Historique des déchets</h1>

    <table v-if="datas.length">
      <thead>
        <tr>
          <th>Images</th>
          <th>Type</th>
          <th>Volume (L)</th>
          <th>Poids (kg)</th>
          <th>Lieu</th>
          <th>Commentaire</th>
          <th>Date</th>
          <th>Synchronisé</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in datas" :key="item.id">
          <td class="flex space-x-2">
            <div v-for="(url, idx) in item.imageUrls" :key="idx"
              class="w-16 h-16 overflow-hidden rounded-lg border-2 border-gray-400">
              <img :src="url" alt="preview" class="w-full h-full object-cover" />
            </div>
          </td>
          <td>{{ item.type }}</td>
          <td>{{ item.volume }}</td>
          <td>{{ item.poids }}</td>
          <td>{{ item.lieu }}</td>
          <td>{{ item.commentaire }}</td>
          <td>{{ formatDate(item.date) }}</td>
          <td>{{ item.sync ? 'Oui' : 'Non' }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else>Aucune donnée enregistrée.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDechets } from '../services/db'

const datas = ref([])

onMounted(async () => {
  const rawData = await getDechets()
  console.log("rawData from DB:", rawData) // <-- ici dans onMounted
  rawData.forEach((item, index) => {
    console.log("Item", index, item)
  })

  datas.value = rawData.map(item => ({
    ...item,
    imageUrls: (item.images || []).map(file => URL.createObjectURL(file)) // <-- sécurité
  }))
})

function formatDate(date) {
  return new Date(date).toLocaleString()
}
</script> -->
