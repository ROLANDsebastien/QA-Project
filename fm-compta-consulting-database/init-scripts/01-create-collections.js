// Création des collections
db = db.getSiblingDB('compta_db');

// Création de la collection Users si elle n'existe pas
if (!db.getCollectionNames().includes('users')) {
  db.createCollection('users');
  
  // Création d'un utilisateur administrateur par défaut
  db.users.insertOne({
    name: "Felicia MITITELU",
    email: "felicia@fmcompta.be",
    password: "$2a$12$ItMLSMNr/TRMVhxtjXEoFu7nYxumTVl6Sc9Tc68ln7duVLLefljqO", // Felicica89 hashé
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print("Collection 'users' créée avec l'administrateur par défaut");
}

// Création de la collection Appointments si elle n'existe pas
if (!db.getCollectionNames().includes('appointments')) {
  db.createCollection('appointments');
  print("Collection 'appointments' créée");
}

// Création des index
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.appointments.createIndex({ userId: 1 });
db.appointments.createIndex({ date: 1 });
db.appointments.createIndex({ status: 1 });
db.appointments.createIndex({ userId: 1, date: 1 });

print("Initialisation de la base de données terminée"); 