// Script pour créer un utilisateur administrateur avec MongoDB
const mongoose = require('mongoose');
const { hash } = require('bcryptjs');
const readline = require('readline');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/compta_db';

// Définition du schéma User
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
  },
  { timestamps: true }
);

// Création du modèle User
let User;
try {
  User = mongoose.model('User');
} catch (error) {
  User = mongoose.model('User', UserSchema);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdminUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log('Connecté à MongoDB');
    
    // Demander les informations de l'administrateur
    const name = await question('Nom complet: ');
    const email = await question('Email: ');
    const password = await question('Mot de passe: ');
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      // Si l'utilisateur existe, mettre à jour son rôle en admin
      const updatedUser = await User.findByIdAndUpdate(
        existingUser._id,
        { role: 'admin' },
        { new: true }
      );
      console.log(`L'utilisateur ${updatedUser.name} a été mis à jour avec le rôle d'administrateur.`);
    } else {
      // Sinon, créer un nouvel utilisateur avec le rôle admin
      const hashedPassword = await hash(password, 12);
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`L'administrateur ${newUser.name} a été créé avec succès.`);
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await mongoose.disconnect();
    rl.close();
  }
}

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

createAdminUser();