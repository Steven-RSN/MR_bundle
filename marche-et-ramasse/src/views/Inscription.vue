<template>
    <div class="flex justify-center mt-10 ">
        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-2">
            <form @submit.prevent="submitForm" class="text-center">
                <h1 class="tracking-wide text-center text-3xl m-2 border-b-2 border-t-2 rounded-lg b-customGreen p-4 ">
                    Inscription
                </h1>
                <img src="/icons/logo/M&R.svg" class="w-16 mx-auto mb-[-4px]" alt="">
                <h2 class="text-xl font-light tracking-wide underline decoration-[0.5px] underline-offset-4 "> MARCHE &
                    RAMASSE </h2>
                <p class=" mt-1.5 "> Pour référencer les déchets rencontrés en randonnée, partager tes actions
                    de ramassage, et encourager une communauté de randonneurs responsables.
                </p>


                <div class="flex items-center border-t border-gray-400 space-x-2 mt-4 pt-6">
                    <img src="/icons/form/icons8-account-100.png" class="w-8" alt="">
                    <label class="label-s" for="pseudo">Pseudo :</label>
                    <input class="flex-1 text-right focus:outline-none" id="pseudo" type="text" v-model="pseudo"
                        required />
                </div>
                <p v-if="error.pseudo" class="text-red-600 text-sm ml-2">{{ error.pseudo }}</p>


                <div class="flex items-center border-t border-gray-400 space-x-2 mt-4 pt-6">
                    <img src="/icons/autres/icons8-email-100.png" class="w-7.5" alt="">
                    <label class="label-s" for="email">Email :</label>
                    <input class="flex-1 text-right focus:outline-none" id="email" type="email" v-model="email"
                        required />
                </div>
                <p v-if="error.email" class="text-red-600 text-sm ml-2"> {{ error.email }}</p>


                <div class="flex items-center border-t border-gray-400 space-x-2 mt-4 pt-6">

                    <img src="/icons/autres/icons8-password-100.png" class="w-8" alt="">
                    <label class="label-s" for="password">Mot de passe :</label>
                    <input class="flex-1 text-right focus:outline-none" id="password" type="password" v-model="password"
                        required />
                </div>

                <div class="flex items-center border-b border-t border-gray-400 space-x-2 mt-4 py-6">

                    <img src="/icons/autres/icons8-password-100.png" class="w-8" alt="">
                    <label class="label-s" for="confirmPassword">Confirmation :</label>
                    <input class="flex-1 text-right focus:outline-none" id="confirmPassword" type="password"
                        v-model="confirmPassword" required />
                </div>
                <p v-if="error.password" class="text-red-600 text-sm ml-2">{{ error.password }}</p>

                <button class="self-center btn btn-custom shadow-lg hover:shadow-xl m-5 my-8" type="submit">S'inscrire
                </button>
            </form>
        </fieldset>

    </div>
</template>

<script setup lang="js">
import { ref } from 'vue'
import { sendUserToServer } from '../services/api'
import { useRouter } from 'vue-router'
const router=useRouter()
const pseudo = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const message = ref('')



let error = ref({
    "pseudo": '',
    "email": '',
    "password": '',
})

let logForm = ref({
    "pseudo": '',
    "email": '',
    "password": '',
    "confirmPassword": '',
})

async function submitForm() {
    logForm.value.pseudo = pseudo.value.trim()
    logForm.value.email = email.value.trim()
    logForm.value.password = password.value
    logForm.value.confirmPassword = confirmPassword.value
    console.log(logForm.value)
    if (!valideData(logForm.value)) {
        return error
    }

    try {

        const res = await sendUserToServer(logForm.value)
        if (res.success) {
            message.value = 'Les données ont été enregistrées !';

            router.push({
                path: '/',
            })
            return
        }

    } catch (e) {
        console.error("Error saving data:", e)
        message.value = 'Une erreur est survenue lors de l\'enregistrement.'
    }

}


function valideData(data) {

    const reg = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-]).{8,}$/;

    if (!reg.test(data.password)) {
        error.value.password = "* Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
    }

    if (data.password !== data.confirmPassword) {
        error.value.password = "* Les mots de passe ne correspondent pas."
    }

    if (data.pseudo.length < 3) {
        error.value.pseudo = "* Le pseudo a besoin de 3 caractères minimum."
    }

    if (!data.email.includes("@")) {
        error.value.email = "* L'email est invalide."
    }
    if (error.value.pseudo || error.value.email || error.value.password) {
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
