// Script pour créer un utilisateur administrateur avec MongoDB
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

async function createAdminUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log("Connecté à MongoDB");

    // Informations de l'administrateur
    const name = "Admin";
    const email = "admin@fmcompta.be";
    const password = await hash("admin123", 10);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Si l'utilisateur existe, mettre à jour son rôle en admin
      existingUser.role = "admin";
      await existingUser.save();
      console.log(`Utilisateur ${email} mis à jour avec le rôle admin`);
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
    console.error("Erreur lors de la création de l'utilisateur admin:", error);
  } finally {
    // Fermer la connexion à MongoDB
    await mongoose.disconnect();
    console.log("Déconnecté de MongoDB");
  }
}

// Exécuter la fonction
createAdminUser();
