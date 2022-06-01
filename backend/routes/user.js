// Imports

const express = require('express');
const userCtrl = require('../controllers/user');

// Création du routeur Express

const router = express.Router();

// Création des routes

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

// Exports

module.exports = router;