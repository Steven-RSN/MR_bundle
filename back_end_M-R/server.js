//creation d'un serveur 
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT= 3000;

//MIDDLEWARES --> à déplacer ?

//Limiter l'access seulement au front end ! 
// app.use(cors({ origin: process.env.LOCAL_URL}))
app.use(cors({ origin: "*"}))
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

//import des routes 
const dechetsRoutes = require('./routes/dechets');
const usersRoutes = require('./routes/users');
console.log('Environnement actuel :', process.env.NODE_ENV);

//  <-----  Routes pour les déchets  ----->
app.use('/',dechetsRoutes);
app.use('/dechets', dechetsRoutes);

// <----- Routes pour les fichiers ----->
app.use('/uploads', express.static('uploads'));

//  <-----  Routes pour les utilisateurs  ----->
app.use('/users', usersRoutes);


//  <-----  ! Routes Test !  ----->

app.get('/test',(req,res)=>{
    res.send(' Le backen est ok ! ')
})

app.listen(PORT,()=>{
    console.log(`Le Serveur backend lancé: ${process.env.BACK_URL}:${PORT}`)
})