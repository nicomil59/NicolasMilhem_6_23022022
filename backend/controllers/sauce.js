// Imports

const Sauce = require('../models/Sauce');
const fs = require('fs');

// ********** Création d'une sauce **********
// ********** Fonction route POST ***********

exports.createSauce = (req, res, next) => {

  // Vérification présence fichier dans requête
  
  if (!req.file) {
    return res.status(400).json({
      message: 'Fichier manquant, impossible de créer la sauce !'
    });
  }

  // Analyse de la requête form-data

  const sauceObj = JSON.parse(req.body.sauce);

  // Création objet sauce et constitution de l'url de l'image à partir de la requête

  const sauce = new Sauce({
    ...sauceObj,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  // Vérification correspondance userId sauce à créer avec userId de l'utilisateur

  if (sauce.userId !== req.auth.userId) {
        
    return res.status(403).json({
      message : 'Requête non autorisée, userId non conforme !'
    });
  }

  // Enregistrement de la sauce créée dans la BD

  sauce.save()
    .then(() => res.status(201).json({
      message: 'Nouvelle sauce créée !'
    }))
    .catch(error => res.status(400).json({
      message: error.message
    }));
};

// ********** Récupération d'une sauce spécifique **********
// ********** Fonction route GET ***************************

exports.getOneSauce = (req, res, next) => {
  
  // Récupération dans la BD de la sauce qui correspond à l'id dans la requête
  
  Sauce.findOne({
    _id: req.params.id
  })
    .then(sauce => {
      res.status(200).json(sauce);
    })
    .catch(error => {
        res.status(404).json({ message: error.message });
    });
};

// ********** Modification d'une sauce **********
// ********** Fonction route PUT ****************

exports.modifySauce = (req, res, next) => {

  // Récupération dans la BD de la sauce qui correspond à l'id dans la requête
  
  Sauce.findOne({
    _id: req.params.id
  })
    .then(sauce => {

      // Vérification de l'existence de la sauce
      
      if (!sauce) {
        return res.status(404).json({
          message: "La sauce n'existe pas !"
        });
      }

      // Vérification si utilisateur = créateur de la sauce
      
      if (sauce.userId !== req.auth.userId) {
        
        return res.status(403).json({
          message : 'Requête non autorisée !'
        });
      }
      
      // Vérification présence image dans la requête

      let sauceObj;

      if (req.file) {

        // Vérification si utilisateur cherche à modifier userId de la sauce
        
        if(JSON.parse(req.body.sauce).userId && JSON.parse(req.body.sauce).userId !== sauce.userId ) {
          console.log("vous n'avez pas le droit de modifier l'userId de cette sauce !!!")
          return res.status(403).json({
            message : 'Requête non autorisée !'
          });
        }
        
        // Suppression de l'ancienne image du dossier images

        const filename = sauce.imageUrl.split('/images/')[1];

        fs.unlink(`images/${filename}`, error => {
          if (error) throw error;
          console.log('Ancienne image effacée !');
        });

        // Traitement de l'objet avec nouvelle image

        sauceObj = {
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        };

      } else {

        // Traitement de l'objet sans image

        sauceObj = { ...req.body };
      }

      // Mise à jour de la sauce
      
      Sauce.updateOne({
        _id: req.params.id
      }, {
        ...sauceObj,
        _id: req.params.id
      })
      .then(() => res.status(200).json({
        message: 'Objet modifié !'
      }))
      .catch(error => res.status(400).json({
        message: error.message
      }));

    })
    .catch(error => {
        res.status(404).json({ message: error.message });
    });
  
  
};

// ********** Suppression d'une sauce **********
// ********** Fonction route DELETE ****************

exports.deleteSauce = (req, res, next) => {

  // Récupération dans la BD de la sauce qui correspond à l'id dans la requête
  
  Sauce.findOne({
      _id: req.params.id
    })
    .then(sauce => {

      // Vérification de l'existence de la sauce
      
      if (!sauce) {
        
        return res.status(404).json({
          message: "La sauce n'existe pas !"
        });
      }

      // Vérification si utilisateur = créateur de la sauce

      if (sauce.userId !== req.auth.userId) {
        
        return res.status(403).json({
          message : 'Requête non autorisée !'
        });
      }

      // Suppression de l'ancienne image du dossier images et suppression de la sauce

      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({
            _id: req.params.id
          })
          .then(() => res.status(200).json({
            message: 'Sauce supprimée !'
          }))
          .catch(error => res.status(400).json({
            message: error.message
          }))
      });
    })
    .catch(error => {
      res.status(400).json({
        message: error.message
      });
    })
};

// ********** Gestion des likes **********
// ********** Fonction route POST ********

exports.manageLikeSauce = (req, res, next) => {

  const { userId, like } = req.body;

  // Récupération dans la BD de la sauce qui correspond à l'id dans la requête

  Sauce.findOne({
    _id: req.params.id
  }).then(sauce => {

      // Cas avec like = 1 *** l'utilisateur like la sauce

      if (like === 1) {

        // Vérification si utilisateur dislikait la sauce
        
        if (sauce.usersDisliked.includes(userId)) {

          return res.status(400).json({
            message: "Requête rejetée : le dislike doit être annulé avant d'ajouter un like"
          });

        }
        
        // Vérification si utilisateur likait déjà la sauce
        
        if (sauce.usersLiked.includes(userId)) {

          return res.status(400).json({
            message: "Sauce déjà likée !"
          });

        } else {

          // Insertion de l'userId de l'utilisateur dans le tableau usersLiked
          // Incrémentation de likes

          Sauce.updateOne({
            _id: req.params.id
          }, {
            $inc: { likes: 1 }, $push: { usersLiked: userId }
          })
          .then(() => res.status(200).json({
            message: 'Sauce likée !'
          }))
          .catch(error => res.status(400).json({
            message: error.message
          }));

        }

      }

      // Cas avec like = -1 *** l'utilisateur dislike la sauce

      if (like === -1) {

        // Vérification si utilisateur likait la sauce
        
        if (sauce.usersLiked.includes(userId)) {

          return res.status(400).json({
            message: "Requête rejetée : le like doit être annulé avant d'ajouter un dislike"
          });

        }
        
        // Vérification si utilisateur dislikait déjà la sauce
        
        if (sauce.usersDisliked.includes(userId)) {

          return res.status(400).json({
            message: "Sauce déjà dislikée !"
          });

        } else {

          // Insertion de l'userId de l'utilisateur dans le tableau usersDisliked
          // Incrémentation de dislikes

          Sauce.updateOne({
            _id: req.params.id
          }, {
            $inc: { dislikes: 1 }, $push: { usersDisliked: userId }
          })
          .then(() => res.status(200).json({
            message: 'Sauce dislikée !'
          }))
          .catch(error => res.status(400).json({
            message: error.message
          }));

        }

      }

      // Cas du like = 0 *** l'utilisateur annule son like ou son dislike

      if (like === 0) {

        // Utilisateur likait la sauce
        
        if (sauce.usersLiked.includes(userId)) {

          // Suppression de l'userId de l'utilisateur du tableau usersLiked
          // Décrémentation de likes

          Sauce.updateOne({
            _id: req.params.id
          }, {
            $inc: { likes: -1 }, $pull: { usersLiked: userId }
          })
          .then(() => res.status(200).json({
            message: 'Like retiré !'
          }))
          .catch(error => res.status(400).json({
            message: error.message
          }));

        }
        
        // Utilisateur dislikait la sauce

        else if (sauce.usersDisliked.includes(userId)) {
          
          // Suppression de l'userId de l'utilisateur du tableau usersDisliked
          // Décrémentation de dislikes

          Sauce.updateOne({
            _id: req.params.id
          }, {
            $inc: { dislikes: -1 }, $pull: { usersDisliked: userId }
          })
          .then(() => res.status(200).json({
            message: 'Dislike retiré !'
          }))
          .catch(error => res.status(400).json({
            message: error.message
          }));

        }

      }

    }
  ).catch(error => {
      
      res.status(404).json({
        message: error.message
      });
    }
  );


};

// ********** Récupération de toutes les sauces **********
// ********** Fonction route GET *************************

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => {
      res.status(200).json(sauces);
    })
    .catch(error => {
      res.status(400).json({
        message: error.message
      });
    }
  );
};