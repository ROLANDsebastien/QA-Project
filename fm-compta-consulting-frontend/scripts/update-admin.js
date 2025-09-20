// Script pour mettre à jour l'utilisateur administrateur avec les nouvelles informations
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const { hash } = require("bcryptjs");

// Configuration MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/compta_db";

// Définition du schéma User
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user", enum: ["user", "admin"] },
  },
  { timestamps: true },
);

// Création du modèle User
let User;
try {
  User = mongoose.model("User");
} catch (error) {
  User = mongoose.model("User", UserSchema);
}

async function updateAdminUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log("Connecté à MongoDB");

    // Nouvelles informations de l'administrateur
    const name = "Admin";
    const email = "admin@fmcompta.be";
    const password = await hash("admin123", 10);

    // Vérifier si un utilisateur admin existe déjà
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      // Mettre à jour l'utilisateur admin existant
      existingAdmin.name = name;
      existingAdmin.email = email;
      existingAdmin.password = password;
      await existingAdmin.save();
      console.log(`Utilisateur admin mis à jour: ${email}`);
    } else {
      // Créer un nouvel utilisateur admin
      const newUser = new User({
        name,
        email,
        password,
        role: "admin",
      });

      await newUser.save();
      console.log(`Nouvel utilisateur admin créé: ${email}`);
    }

    console.log("Opération terminée avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'utilisateur admin:",
      error,
    );
  } finally {
    // Fermer la connexion à MongoDB
    await mongoose.disconnect();
    console.log("Déconnecté de MongoDB");
  }
}

// Exécuter la fonction
updateAdminUser();
