// Imports

const multer = require('multer');

// Création d'un dictionnaire MIME_TYPES avec les types de fichier acceptés

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Gestion du stockage des fichiers avec Multer

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

// Exports

module.exports = multer({storage: storage}).single('image');