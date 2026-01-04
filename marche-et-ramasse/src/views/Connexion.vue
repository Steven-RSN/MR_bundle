<template>
    <div class="flex justify-center mt-10 ">
        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-2">
            <form @submit.prevent="submitForm" class="text-center">
                <h1
                    class="tracking-wide text-center text-2xl m-2 mt-1 border-b-1 border-t-1 rounded-lg b-customGreen p-4 ">
                    Connexion
                </h1>
                <img src="/icons/logo/M&R.svg" class="w-16 mx-auto mb-[-4px]" alt="">
                <h2 class="text-xl font-light tracking-wide underline decoration-[0.5px] underline-offset-4 "> MARCHE &
                    RAMASSE </h2>
                <p class=" mt-1.5 mb-4"> Pour référencer les déchets rencontrés en randonnée, partager tes actions
                    de ramassage, et encourager une communauté de randonneurs responsables.
                </p>


                <div class="flex items-center border-t border-gray-400 space-x-2 mt-4 pt-6">
                    <img src="/icons/autres/icons8-email-100.png" class="w-8" alt="">
                    <label class="label-s" for="poids">Email :</label>
                    <input class="flex-1 text-right focus:outline-none" id="email" type="email" v-model="email"
                        required />
                </div>
                <p v-if="error.email" class="text-red-600 text-sm ml-2"> {{ error.email }}</p>


                <div class="flex items-center border-b border-t border-gray-400 space-x-2 mt-4 py-6">

                    <img src="/icons/autres/icons8-password-100.png" class="w-8" alt="">
                    <label class="label-s" for="poids">Password :</label>
                    <input class="flex-1 text-right focus:outline-none" id="password" type="password" v-model="password"
                        required />
                </div>
                <p v-if="error.password" class="text-red-600 text-sm ml-2">{{ error.password }}</p>

                <p class="text-[10px] mt-1">Impossible de se connecter ? Changez votre
                    <span class=" "><a href="" class=" text-[10px] underline">mot de passe ici.</a></span>
                </p>

                <button class="self-center btn btn-custom shadow-lg hover:shadow-xl m-5 my-8" type="submit">Se
                    connecter
                </button>
            </form>
        </fieldset>

    </div>
</template>

<script setup lang="js">
import { ref } from 'vue'
import { login, sendUserToServer } from '../services/api'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

//const pseudo = ref('')
const email = ref('')
const password = ref('')

let error = ref({
    "email": '',
    "password": '',
})
defineExpose({ valideData, error });


let logForm = ref({
    "email": '',
    "password": '',
})

async function submitForm() {
    logForm.value.email = email.value.trim()
    logForm.value.password = password.value

    console.log(logForm.value)

    if (!valideData(logForm.value)) {
        return error
    }

    try {
        const res = await login(logForm.value);
        console.log('Réponse backend:', res);

        if (res.success && res.user) {
            console.log(`${res.user}`);

            userStore.setUser({
                id: res.user.id,
                pseudo: res.user.pseudo,
                email: res.user.email,
                token: res.user.token,
            })
            console.log('Utilisateur stocké dans Pinia:', userStore)
            console.log('Utilisateur id:', userStore.id)
            console.log('Utilisateur token:', userStore.token,)
            console.log("Utilisateur pseduo : ", userStore.pseudo)
            router.push({
                name: 'Accueil',
                params:''
            })
        } else {
            console.log('Erreur login:', res.message);
        }
    } catch (err) {
        console.error('Erreur lors du login:', err);
    }
}

function valideData(data) {

    if (data.password.length == 0) {
        error.value.password = "* Entrez le mot de passe."
    }

    if (!data.email.includes("@")) {
        error.value.email = "* L'email est invalide."
    }
    if (error.value.email || error.value.password) {
        return false
    }
    return true
}

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
