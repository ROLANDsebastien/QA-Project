import mongoose, { Schema, Document, model, models } from 'mongoose';
import { IUser } from './User';

export interface IAppointment extends Document {
  userId: mongoose.Types.ObjectId | string;
  date: string;
  time: string;
  reason: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user?: IUser;
}

const AppointmentSchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true // Index pour améliorer les requêtes par utilisateur
    },
    date: { 
      type: String, 
      required: true,
      index: true // Index pour améliorer les requêtes par date
    },
    time: { type: String, required: true },
    reason: { type: String, required: true },
    status: { 
      type: String, 
      default: 'pending', 
      enum: ['pending', 'confirmed', 'cancelled'],
      index: true // Index pour améliorer les requêtes par statut
    },
  },
  { 
    timestamps: true,
    // Ajouter configuration pour optimiser les performances
    toJSON: { 
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// Ajouter des index composites pour les requêtes courantes
AppointmentSchema.index({ userId: 1, date: 1 });
AppointmentSchema.index({ date: 1, status: 1 });

// Optimisation: utiliser une fonction de création de modèle réutilisable
export default models.Appointment || model<IAppointment>('Appointment', AppointmentSchema);