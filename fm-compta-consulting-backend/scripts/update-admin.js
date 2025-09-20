// Script pour mettre à jour l'utilisateur administrateur avec les nouvelles informations
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const { hash } = require("bcryptjs");

// Configuration MongoDB
// Utiliser DATABASE_URL fourni par l'environnement du conteneur, sinon fallback (moins fiable en conteneur)
const MONGODB_URI =
  process.env.DATABASE_URL ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/compta_db";

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

    // Informations de l'administrateur cible
    const targetEmail = "admin@fmcompta.be";
    const targetName = "Admin";
    const targetPassword = await hash("admin123", 10);

    // Rechercher l'utilisateur par email
    let user = await User.findOne({ email: targetEmail });

    if (user) {
      // L'utilisateur existe : le mettre à jour
      user.name = targetName;
      user.password = targetPassword;
      user.role = "admin"; // S'assurer que le rôle est admin
      await user.save();
      console.log(
        `Utilisateur existant mis à jour (${targetEmail}) avec le rôle admin.`,
      );
    } else {
      // L'utilisateur n'existe pas : le créer
      const newUser = new User({
        name: targetName,
        email: targetEmail,
        password: targetPassword,
        role: "admin",
      });
      await newUser.save();
      console.log(`Nouvel utilisateur admin créé: ${targetEmail}`);
    }

    console.log("Opération terminée avec succès");
  } catch (error) {
    // Gérer spécifiquement l'erreur de clé dupliquée au cas où (par exemple, condition de concurrence)
    if (error.code === 11000) {
      console.warn(
        `Avertissement : L'email ${targetEmail} existe déjà (erreur de clé dupliquée interceptée). L'opération a peut-être déjà été effectuée.`,
      );
    } else {
      console.error(
        "Erreur lors de la mise à jour/création de l'utilisateur admin:",
        error,
      );
    }
  } finally {
    // Fermer la connexion à MongoDB
    await mongoose.disconnect();
    console.log("Déconnecté de MongoDB");
  }
}

// Exécuter la fonction
updateAdminUser();
