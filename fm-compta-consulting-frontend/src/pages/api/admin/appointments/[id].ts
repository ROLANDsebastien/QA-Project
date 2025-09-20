import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import dbConnect from "@/lib/mongoose";
import Appointment from "@/models/Appointment";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  // Vérifier si l'utilisateur est authentifié et est administrateur
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (session.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }

  // Se connecter à MongoDB
  await dbConnect();

  // Find the appointment
  const appointment = await Appointment.findById(id).populate(
    "userId",
    "name email",
  );

  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case "GET":
      return res.status(200).json(appointment);

    case "PUT":
      try {
        const { status } = req.body;

        if (
          !status ||
          !["pending", "confirmed", "cancelled"].includes(status)
        ) {
          return res.status(400).json({ error: "Invalid status value" });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
          id,
          { status },
          { new: true },
        ).populate("userId", "name email");

        return res.status(200).json(updatedAppointment);
      } catch (error) {
        console.error("Error updating appointment:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
