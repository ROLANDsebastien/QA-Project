import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

// Charger les variables d'environnement (peut être redondant si server.ts le fait déjà, mais sans danger)
dotenv.config();

// Initialiser l'application Express
const app = express();

// Configuration CORS plus sécurisée
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:8081', 'http://frontend:3000', 'http://frontend.fm-compta-pipeline.orb.local'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400  // 24 heures
};

// Middleware
app.use(cors(corsOptions));
// app.use(helmet()); // Remplacé par une configuration plus explicite ci-dessous
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(), // Commence avec les directives par défaut
        "default-src": ["'self'"], // Par défaut, autorise uniquement depuis la même origine
        "script-src": ["'self'"], // Autorise les scripts depuis la même origine
        "style-src": ["'self'", "'unsafe-inline'"], // Autorise les styles depuis la même origine et les styles en ligne (souvent nécessaire)
        "img-src": ["'self'", "data:"], // Autorise les images depuis la même origine et les data URIs
        // Ajoutez d'autres directives si nécessaire pour les polices, les connexions, etc.
        // Exemple: "connect-src": ["'self'", "api.example.com"],
      },
    },
    // Vous pouvez ajuster d'autres options de helmet ici si besoin
    // Par exemple, si vous avez des problèmes avec les iframes ou les ressources cross-origin:
    // crossOriginEmbedderPolicy: false,
    // crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, 
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de log général
app.use((req, res, next) => {
  console.log(`>>> [APP LOG] Received Request: ${req.method} ${req.path}`);
  next();
});

// Importer les modèles (enregistre les schémas auprès de Mongoose)
import './models/User';
import './models/Appointment';

// Importer les routeurs
import authRouter from './routes/auth';

// Routes API
app.get('/api/health', (req: Request, res: Response) => {
  console.log('[/api/health] Request received');
  res.status(200).json({ status: 'ok' });
});

// Utiliser les routeurs
app.use('/api/auth', authRouter);

// Exporter l'application configurée (SANS démarrer le serveur ici)
export default app;