// Imports

const jwt = require('jsonwebtoken');

// Vérification de l'authentification avant envoi de la requête

module.exports = (req, res, next) => {
  try {
    
    // Récupération de l'userId depuis le token décodé
    
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    const userId = decodedToken.userId;

    // Enregistrement de l'userId dans l'objet de requête

    req.auth = { userId };

    // Vérification de la correspondance du userId du token avec l'userId de la requête

    if (req.body.userId && req.body.userId !== userId) {
      throw 'User ID non valide !';
    } else {
      next();
    }
  } catch (error) {
    
    res.status(401).json({
      message: "Echec d'authentification",
      error: error
    });
  }
};