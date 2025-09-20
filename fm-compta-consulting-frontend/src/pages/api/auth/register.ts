import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, password } = req.body;

  // Valider les données d'entrée
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  // Construire l'URL de l'API backend
  const backendApiUrl = process.env.BACKEND_API_URL || 'http://localhost:3001/api';

  try {
    // Transférer la requête au service backend
    const backendResponse = await fetch(`${backendApiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    // Récupérer la réponse du backend
    const data = await backendResponse.json();

    // Si la réponse du backend n'est pas OK, la transmettre au client
    if (!backendResponse.ok) {
      return res.status(backendResponse.status).json(data);
    }

    // Transmettre la réponse de succès du backend au client
    res.status(201).json(data);
  } catch (error) {
    console.error('Error forwarding request to backend:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}