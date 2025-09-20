import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      default: 'user', 
      enum: ['user', 'admin'],
      index: true
    },
  },
  { 
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// Optimisation: utiliser une fonction de création de modèle réutilisable
export default models.User || model<IUser>('User', UserSchema);