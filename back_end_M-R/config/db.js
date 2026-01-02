const mysql = require('mysql2/promise');

const connectionDB = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
module.exports = connectionDB; 



//creer un connection avec sql 
// const connectionDB = mysql.createPool({
//     host: 'localhost',     // ou IP du serveur MySQL
//     user: 'root',          // utilisateur MySQL
//     password: '',   // mot de passe MySQL
//     database: 'dechets_montagne'
// })
// module.exports = connectionDB; 