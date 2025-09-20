import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app'; // Importer l'application configurée

// Charger les variables d'environnement
dotenv.config();

// Lire le port depuis l'environnement ou utiliser 3001 par défaut
const PORT = process.env.PORT ?? 3001;

// Lire l'URL de la base de données depuis l'environnement avec une valeur par défaut
const DEFAULT_DB_URL = 'mongodb://admin:password@database:27017/compta_db?authSource=admin';
const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGODB_URI || DEFAULT_DB_URL;

if (!DATABASE_URL) {
    console.warn('Avertissement: La variable d\'environnement DATABASE_URL est manquante. Utilisation de la valeur par défaut.');
    // Ne pas terminer le processus, utiliser la valeur par défaut
}

// Fonction pour démarrer le serveur
const startServer = async () => {
  try {
    console.log('Tentative de connexion à MongoDB...');
    await mongoose.connect(DATABASE_URL);
    // Éviter d'afficher les credentials dans les logs
    const dbUrlLog = DATABASE_URL.includes('@') ? DATABASE_URL.substring(DATABASE_URL.indexOf('@') + 1) : DATABASE_URL;
    console.log(`Connexion à MongoDB établie avec succès (${dbUrlLog})`);

    // Démarrer le serveur Express APRÈS la connexion réussie à la DB
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  } catch (err) {
    console.error('Échec de la connexion à MongoDB ou du démarrage du serveur:', err);
    process.exit(1);
  }
};

// Appeler la fonction de démarrage
startServer(); 