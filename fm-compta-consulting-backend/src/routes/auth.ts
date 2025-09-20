import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User'; // Assurez-vous que le chemin d'importation est correct

const router = express.Router();

// Récupérer le secret JWT (essentiel!)
// Idéalement, passez-le via config ou injection de dépendances plutôt que process.env directement dans le routeur
const DEFAULT_JWT_SECRET = 'default_jwt_secret_key_replace_in_production';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
if (!process.env.JWT_SECRET) {
    console.warn('Avertissement dans auth.ts: La variable d\'environnement JWT_SECRET est manquante! Utilisation d\'une valeur par défaut pour le développement.');
    // En production, cette valeur devrait être remplacée par une variable d'environnement sécurisée
}

// Inscription (Register)
router.post('/register', async (req: Request, res: Response) => {
  // console.log('[/api/auth/register] DEBUG HIT');
  // res.status(200).send('Register DEBUG OK');
  console.log('[/api/auth/register] Request received with body:', req.body);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    console.log('[/api/auth/register] Validation failed: Missing fields');
    return res.status(400).json({ message: 'Nom, email et mot de passe sont requis' });
  }

  try {
    console.log(`[/api/auth/register] Checking for existing user: ${email.toLowerCase()}`);
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log(`[/api/auth/register] User already exists: ${email.toLowerCase()}`);
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }
    console.log(`[/api/auth/register] User does not exist. Proceeding with hashing password.`);

    const salt = await bcrypt.genSalt(10);
    console.log(`[/api/auth/register] Salt generated.`);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(`[/api/auth/register] Password hashed.`);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    console.log(`[/api/auth/register] New user object created.`);

    await newUser.save();
    console.log(`[/api/auth/register] User saved successfully with ID: ${newUser.id}`);

    res.status(201).json({ 
      message: 'Utilisateur créé avec succès', 
      user: newUser 
    });

  } catch (error: any) {
    console.error("[/api/auth/register] Erreur attrapée:", error);

    // Gestion de l'erreur de clé dupliquée de MongoDB (code 11000)
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Gestion des erreurs de validation de Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Erreur de validation', details: error.message });
    }

    // Pour toutes les autres erreurs, renvoyer une erreur 500 générique
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Connexion (Login)
router.post('/login', async (req: Request, res: Response) => {
  // console.log('[/api/auth/login] DEBUG HIT');
  // res.status(200).send('Login DEBUG OK');
  // /* --- CODE ORIGINAL COMMENTÉ ---
  console.log('[/api/auth/login] Request received with body:', req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('[/api/auth/login] Validation failed: Missing fields');
    return res.status(400).json({ message: 'Email et mot de passe sont requis' });
  }

  if (!JWT_SECRET) {
    console.error("[/api/auth/login] JWT_SECRET n'est pas défini!");
    return res.status(500).json({ message: 'Erreur de configuration serveur' });
  }

  try {
    console.log(`[/api/auth/login] Finding user: ${email.toLowerCase()}`);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`[/api/auth/login] User not found: ${email.toLowerCase()}`);
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    console.log(`[/api/auth/login] User found: ${user.id}. Comparing password.`);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[/api/auth/login] Password mismatch for user: ${user.id}`);
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    console.log(`[/api/auth/login] Password matched for user: ${user.id}. Generating token.`);

    const payload = { userId: user.id, email: user.email, role: user.role };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' },
      (err: Error | null, token: string | undefined) => {
        if (err) {
            console.error("[/api/auth/login] Erreur lors de la génération du token JWT:", err);
            return res.status(500).json({ message: 'Erreur interne lors de la tentative de connexion' });
        }
        console.log(`[/api/auth/login] Token generated successfully for user: ${user.id}`);
        
        res.status(200).json({
          message: 'Connexion réussie',
          token: token, 
          user: user
        });
      }
    );

  } catch (error) {
    console.error("[/api/auth/login] Erreur attrapée:", error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
  // --- FIN CODE ORIGINAL COMMENTÉ --- */
});

// Validation endpoint (pour NextAuth)
router.post('/validate', async (req: Request, res: Response) => {
  // console.log('[/api/auth/validate] DEBUG HIT');
  // res.status(200).send('Validate DEBUG OK');
  // /* --- CODE ORIGINAL COMMENTÉ ---
  const { email, password } = req.body;

  console.log(`[/api/auth/validate] Received request. Email: [${email}], Password: [${password}]`);

  if (!email || !password) {
    console.log('[/api/auth/validate] Validation failed: Missing email or password.');
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    console.log(`[/api/auth/validate] Finding user by email: ${email.toLowerCase()}`);
    const user = await User.findOne({ email: email.toLowerCase() }); 

    if (!user) {
      console.log(`[/api/auth/validate] User not found for email: ${email.toLowerCase()}`);
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    console.log(`[/api/auth/validate] User found: ${user.id}. Stored hash: ${user.password}`);
    console.log(`[/api/auth/validate] Comparing received password [${password}] with stored hash`);
    const isMatch = await bcrypt.compare(password, user.password);
   
    console.log(`[/api/auth/validate] bcrypt.compare result for user ${user.id}: ${isMatch}`);

    if (!isMatch) {
      console.log(`[/api/auth/validate] Password mismatch for user: ${user.id}`);
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    console.log(`[/api/auth/validate] Password matched for user: ${user.id}. Sending user data.`);
    
    res.status(200).json({
      id: user._id.toString(), 
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    console.error('[/api/auth/validate] Error during validation:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la validation' });
  }
  // --- FIN CODE ORIGINAL COMMENTÉ --- */
});

export default router; 