import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '@/lib/mongoose';
import Appointment from '@/models/Appointment';

// Type pour les paramètres de pagination et filtrage
type QueryParams = {
  page: number;
  limit: number;
  sort?: string;
  status?: string;
  date?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ajouter en-têtes de cache pour améliorer les performances
  res.setHeader('Cache-Control', 'private, s-maxage=10, stale-while-revalidate=59');
  
  const session = await getServerSession(req, res, authOptions);

  // Check if user is authenticated and is an admin
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      try {
        // Connect to MongoDB
        await dbConnect();
        
        // Extraire les paramètres de pagination et filtrage
        const { 
          page = '1', 
          limit = '20', 
          sort = 'date', 
          status,
          date 
        } = req.query;
        
        // Convertir en nombres et valider
        const queryParams: QueryParams = {
          page: parseInt(page as string, 10),
          limit: parseInt(limit as string, 10),
          sort: sort as string,
          status: status as string | undefined,
          date: date as string | undefined
        };
        
        // Validation des paramètres
        if (isNaN(queryParams.page) || isNaN(queryParams.limit)) {
          return res.status(400).json({ error: 'Invalid pagination parameters' });
        }
        
        // Calculer l'offset pour la pagination
        const skip = (queryParams.page - 1) * queryParams.limit;
        
        // Construire le filtre
        const filter: any = {};
        if (queryParams.status) {
          filter.status = queryParams.status;
        }
        if (queryParams.date) {
          filter.date = queryParams.date;
        }
        
        // Déterminer le champ de tri
        const sortField = queryParams.sort || 'date';
        
        // Exécuter les deux requêtes en parallèle pour améliorer les performances
        const [appointments, totalCount] = await Promise.all([
          Appointment.find(filter)
            .populate('userId', 'name email')
            .sort({ [sortField]: 1 })
            .skip(skip)
            .limit(queryParams.limit)
            .select('date time reason status userId') // Optimisation: sélectionner uniquement les champs nécessaires
            .lean(), // Optimisation: convertir en objets JS simples
          
          Appointment.countDocuments(filter) // Compter le nombre total d'éléments filtrés
        ]);
        
        // Retourner les résultats avec métadonnées de pagination
        return res.status(200).json({
          appointments,
          pagination: {
            total: totalCount,
            page: queryParams.page,
            limit: queryParams.limit,
            pages: Math.ceil(totalCount / queryParams.limit)
          }
        });
      } catch (error) {
        console.error('Error fetching appointments:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}