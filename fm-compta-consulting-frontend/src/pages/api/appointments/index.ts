import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongoose';
import Appointment from '@/models/Appointment';

// Type pour les paramètres de pagination
type PaginationParams = {
  page: number;
  limit: number;
  sort?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ajouter en-têtes de cache pour améliorer les performances
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');
  
  const session = await getServerSession(req, res, authOptions);

  // Check if user is authenticated
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  // Connect to MongoDB
  await dbConnect();

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      try {
        // Extraire les paramètres de pagination de la requête
        const { page = '1', limit = '10', sort = 'date' } = req.query;
        
        // Convertir en nombres
        const paginationParams: PaginationParams = {
          page: parseInt(page as string, 10),
          limit: parseInt(limit as string, 10),
          sort: sort as string
        };
        
        // Validation des paramètres
        if (isNaN(paginationParams.page) || isNaN(paginationParams.limit)) {
          return res.status(400).json({ error: 'Invalid pagination parameters' });
        }
        
        // Calculer l'offset pour la pagination
        const skip = (paginationParams.page - 1) * paginationParams.limit;
        
        // Déterminer le champ de tri
        const sortField = paginationParams.sort || 'date';
        
        // Requêtes optimisées avec projection (select) pour ne récupérer que les champs nécessaires
        const [appointments, totalCount] = await Promise.all([
          Appointment.find({ userId })
            .sort({ [sortField]: 1 }) // 1 pour ordre ascendant
            .skip(skip)
            .limit(paginationParams.limit)
            .lean(), // Optimisation: retourner des objets JavaScript simples au lieu de documents Mongoose
          
          Appointment.countDocuments({ userId }) // Compter le nombre total de documents
        ]);
        
        // Retourner les résultats avec métadonnées de pagination
        return res.status(200).json({
          appointments,
          pagination: {
            total: totalCount,
            page: paginationParams.page,
            limit: paginationParams.limit,
            pages: Math.ceil(totalCount / paginationParams.limit)
          }
        });
      } catch (error) {
        console.error('Error fetching appointments:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    case 'POST':
      try {
        // Create a new appointment in the database
        const { date, time, reason } = req.body;

        if (!date || !time || !reason) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const newAppointment = await Appointment.create({
          userId,
          date,
          time,
          reason,
          status: 'pending'
        });
        
        return res.status(201).json(newAppointment);
      } catch (error) {
        console.error('Error creating appointment:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}