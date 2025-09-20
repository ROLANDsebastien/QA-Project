// S'assurer que l'utilisateur administrateur existe
db = db.getSiblingDB("compta_db");

// remove old admin
db.users.deleteOne({ email: "felicia@fmcompta.be" });

// Rechercher l'administrateur par son email
const adminExists = db.users.findOne({ email: "admin@fmcompta.be" });

// Si l'administrateur n'existe pas, le créer
if (!adminExists) {
  print("Création du compte administrateur...");

  db.users.insertOne({
    name: "Admin",
    email: "admin@fmcompta.be",
    password: "$2a$10$3Hsp0C5pjCVoP9d6ji1ebeswqawTaZmROiXoysDs9KqvbiP7.BWya", // admin123 hashé
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  print("Compte administrateur créé avec succès");
} else {
  print("Le compte administrateur existe déjà");
}

// S'assurer que le rôle est bien 'admin'
db.users.updateOne(
  { email: "admin@fmcompta.be" },
  {
    $set: {
      role: "admin",
      password: "$2a$10$3Hsp0C5pjCVoP9d6ji1ebeswqawTaZmROiXoysDs9KqvbiP7.BWya", // S'assurer que le mot de passe est à jour
    },
  },
);

print("Le compte administrateur est configuré correctement");
