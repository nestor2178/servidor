import mongoose from "mongoose";
import AutoIncrement from "mongoose-sequence";

// Definir el esquema
const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 70,
      trim: true,
      match: /^[\w\sáéíóúüñÁÉÍÓÚÜÑ!@#$%.,?"'<>\/\\=\-():]{3,70}$/,
    },
    text: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1300,
      trim: true,
      match:
        /^[\w\sáéíóúüñÁÉÍÓÚÜÑ!@#<span class="math-inline">%\.,?"'<\>\\/\\\\\=\\\-\(\)\:\[\\\]\{\}\*\+^%</span>#@!|`~&\n\r\t=.,;]{10,1300}$/,
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
  inc_field: "ticket",
  id: "ticketNums",
  start_seq: 500,
});

// Exportar el modelo
export default mongoose.model("Note", noteSchema);
