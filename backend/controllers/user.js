// Imports

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Cryptojs = require("crypto-js");
const User = require('../models/User');
const isEmailValid = require('../utils/emailValid');
const { isPasswordValid, validationMessages } = require('../utils/passwordValid');

require('dotenv').config();

// Gestion de la création d'un nouvel utilisateur

exports.signup = (req, res, next) => {
  
  // Vérification de la validité de l'email
  
  if (!isEmailValid(req.body.email)) {
    return res.status(400).json({
      message: 'adresse email non valide !'
    });
  }

  // Vérification de la validité du mot de passe

  if (!isPasswordValid(req.body.password)) {
    
    return res.status(400).json({
      message: validationMessages(req.body.password)
    });
  }

  // Chiffrement de l'email

  const emailEncrypted = Cryptojs.HmacSHA256(req.body.email, process.env.CRYPTOJS_KEY).toString();
  console.log(emailEncrypted)

  // Hachage du mot de passe avant enregistrement du nouvel utilisateur dans la BD
  
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: emailEncrypted,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ message: error.message }));
    })
    .catch(error => res.status(500).json({ message: error.message }));

};

// Gestion de la connexion d'un utilisateur

exports.login = (req, res, next) => {

  // Chiffrement de l'email
  
  const emailEncrypted = Cryptojs.HmacSHA256(req.body.email, process.env.CRYPTOJS_KEY).toString();  

  // Récupération de l'email chiffré dans la BD
  
  User.findOne({
      email: emailEncrypted
    })
    .then(user => {
      
      // Vérification de l'existence de l'utilisateur
      
      if (!user) {
        return res.status(401).json({
          message: 'Utilisateur non trouvé !'
        });
      }

      // Comparaison du mot de passe entré par utilisateur avec mot de passe hashé dans la BD

      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ message: 'Mot de passe incorrect !' });
          }
          // Renvoi du token encodé contenant le userId
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.TOKEN_SECRET_KEY,
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ message: error.message }));

    })
    .catch(error => res.status(500).json({
      message: error.message
    }));
};