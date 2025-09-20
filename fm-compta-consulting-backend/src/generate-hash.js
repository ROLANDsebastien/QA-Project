const bcrypt = require('bcryptjs');

// Récupérer le mot de passe depuis les arguments de la ligne de commande
const passwordToHash = process.argv[2];

if (!passwordToHash) {
  console.error('Erreur: Veuillez fournir un mot de passe en argument.');
  console.log('Usage: node generate-hash.js <votre_mot_de_passe>');
  process.exit(1);
}

const saltRounds = 10; // Nombre de tours pour le salage (10 est une bonne base)

console.log(`Mot de passe fourni: ${passwordToHash}`);

// Utilisation de promesses au lieu de callbacks
async function generateHash() {
  try {
    const hash = await bcrypt.hash(passwordToHash, saltRounds);
    console.log('Hash généré:', hash);
  } catch (err) {
    console.error('Erreur lors du hachage:', err);
  }
}

generateHash(); 