import mongoose from 'mongoose';
import AutoIncrement from 'mongoose-sequence';

// Definir el esquema
const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 60,
      trim: true,
      match: /^[A-z0-9\s!@#$%.,?]{3,60}$/,
    },
    text: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
      trim: true,
      match: /^[A-z0-9\s!@#$%.,?():"'/-]{10,1000}$/,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Plugin de autoincremento
noteSchema.plugin(AutoIncrement(mongoose), {
  inc_field: 'ticket',
  id: 'ticketNums',
  start_seq: 500,
});

// Exportar el modelo
export default mongoose.model('Note', noteSchema);
