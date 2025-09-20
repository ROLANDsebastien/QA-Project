import mongoose from 'mongoose';

// Dans Docker, 'mongodb' est le nom du service dans docker-compose
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@database:27017/compta_db?authSource=admin';

// Cache de la connexion pour éviter de multiples connexions en développement
let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Optimiser la connexion MongoDB
      connectTimeoutMS: 10000, // Augmenter le délai d'attente de connexion
      socketTimeoutMS: 45000, // Augmenter le délai d'attente des sockets
      // Optimiser les performances
      maxPoolSize: 10, // Limiter le nombre de connexions simultanées
      minPoolSize: 5, // Garder un minimum de connexions ouvertes
      // Améliorer la résilience
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 30000,
    };

    // Optimiser les logs
    mongoose.set('debug', process.env.NODE_ENV === 'development');

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch(err => {
      console.error('MongoDB connection error:', err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;