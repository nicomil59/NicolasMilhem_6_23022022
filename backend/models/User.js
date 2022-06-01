// Imports

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Schéma de données utilisateur

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Utilisation d'un plugin Mongoose pour vérifier l'unicité de l'email dans la BD

userSchema.plugin(uniqueValidator);

// Export du modèle User

module.exports = mongoose.model('User', userSchema);