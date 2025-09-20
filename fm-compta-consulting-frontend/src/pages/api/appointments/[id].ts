import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongoose';
import Appointment from '@/models/Appointment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  // Vérifier si l'utilisateur est authentifié
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  // Se connecter à MongoDB
  await dbConnect();

  // Trouver le rendez-vous
  const appointment = await Appointment.findById(id);
  
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  // Vérifier si le rendez-vous appartient à l'utilisateur actuel
  if (appointment.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Gérer les différentes méthodes HTTP
  switch (req.method) {
    case 'GET':
      return res.status(200).json(appointment);

    case 'PUT':
      const { date, time, reason } = req.body;

      if (!date || !time || !reason) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const updatedAppointment = await Appointment.findByIdAndUpdate(
        id,
        {
          date,
          time,
          reason
        },
        { new: true }
      );

      return res.status(200).json(updatedAppointment);

    case 'DELETE':
      const deletedAppointment = await Appointment.findByIdAndDelete(id);
      return res.status(200).json(deletedAppointment);

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}