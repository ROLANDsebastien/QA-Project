import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]"; // Assurez-vous que le chemin est correct
import dbConnect from "@/lib/mongoose";
import Appointment from "@/models/Appointment";
import { isValid, parseISO } from 'date-fns';

// Fonction pour gérer la récupération des rendez-vous (GET)
async function getAppointments(userId: string, res: NextApiResponse) {
    try {
        console.log(`[API /appointments GET] Fetching appointments for user ID: ${userId}`);
        const appointments = await Appointment.find({ userId: userId }).sort({ date: 1 });
        console.log(`[API /appointments GET] Found ${appointments.length} appointments for user ID: ${userId}`);
        return res.status(200).json(appointments);
    } catch (error) {
        console.error(`[API /appointments GET] Error fetching appointments for user ${userId}:`, error);
        return res.status(500).json({ error: "Internal server error while fetching appointments" });
    }
}

// Fonction pour gérer la création d'un rendez-vous (POST)
async function createAppointment(userId: string, body: any, res: NextApiResponse) {
    try {
        const { date, time, reason } = body;
        console.log(`[API /appointments POST] Received data for user ${userId}:`, { date, time, reason });

        // Validation simple des données d'entrée
        if (!date || !time || !reason) {
            console.log(`[API /appointments POST] Invalid input data for user ${userId}: Missing fields.`);
            return res.status(400).json({ error: "Bad Request: Missing required fields (date, time, reason)" });
        }

        // Combiner date et heure et valider
        const dateTimeString = `${date}T${time}:00.000Z`;
        const appointmentDate = parseISO(dateTimeString);

        if (!isValid(appointmentDate)) {
            console.log(`[API /appointments POST] Invalid date/time format for user ${userId}: ${dateTimeString}`);
            return res.status(400).json({ error: "Bad Request: Invalid date or time format." });
        }

        // Vérifier si la date est dans le futur
        if (appointmentDate <= new Date()) {
            console.log(`[API /appointments POST] Appointment date is not in the future for user ${userId}: ${appointmentDate}`);
            return res.status(400).json({ error: "Bad Request: Appointment date must be in the future." });
        }

        const newAppointment = new Appointment({
            userId: userId,
            date: appointmentDate,
            reason: reason,
            status: "pending"
        });

        console.log(`[API /appointments POST] Attempting to save new appointment for user ${userId}:`, newAppointment);
        await newAppointment.save();
        console.log(`[API /appointments POST] Appointment saved successfully for user ${userId}. ID: ${newAppointment._id}`);

        return res.status(201).json(newAppointment);
    } catch (error) {
        console.error(`[API /appointments POST] Error creating appointment for user ${userId}:`, error);
        if (error instanceof Error && error.name === 'ValidationError') {
            const validationError = error as any;
            console.log(`[API /appointments POST] Mongoose validation error for user ${userId}:`, validationError.errors);
            return res.status(400).json({ error: "Validation Error", details: validationError.errors });
        }
        return res.status(500).json({ error: "Internal server error while creating appointment" });
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const session = await getServerSession(req, res, authOptions);

    // 1. Vérifier l'authentification
    if (!session || !session.user || !session.user.id) {
        console.log("[API /appointments] Unauthorized access attempt.");
        return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    const userId = session.user.id;
    console.log(`[API /appointments] Request received for user ID: ${userId}, Method: ${req.method}`);

    try {
        // 2. Connexion à la base de données
        await dbConnect();
        console.log("[API /appointments] Database connected successfully.");

        switch (req.method) {
            case "GET":
                // Appeler la fonction dédiée pour GET
                return await getAppointments(userId, res);

            case "POST":
                // Appeler la fonction dédiée pour POST
                return await createAppointment(userId, req.body, res);

            // 5. Méthodes non autorisées
            default:
                console.log(`[API /appointments] Method Not Allowed: ${req.method} for user ${userId}`);
                res.setHeader("Allow", ["GET", "POST"]);
                return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
        }
    } catch (dbError) {
        console.error("[API /appointments] Database connection error:", dbError);
        return res.status(500).json({ error: "Database connection error" });
    }
}
