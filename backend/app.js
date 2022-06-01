// Imports

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

require('dotenv').config();

// Création de l'application Express

const app = express();

// Connexion à la BD MongoDB avec Mongoose

mongoose.connect(`mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}${process.env.CLUSTER_DB}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Middleware de Express qui analyse requêtes JSON entrantes et met données analysés dans req.body

app.use(express.json());

// Middleware - ajout de headers de contrôle d'accès pour tous les objets de réponse

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Gestion de la ressource "images" de manière statique

app.use('/images', express.static(path.join(__dirname, 'images')));

// Enregistrements des routes

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

// Export de l'app

module.exports = app;