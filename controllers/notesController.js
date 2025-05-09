import Note from '../models/Note.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';

// @desc Obtener todas las notas
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
  try {
    // 1. Obtener TODAS las notas
    const notes = await Note.find().lean().exec();

    if (!notes?.length) {
      return res.status(200).json([]); // Devuelve array vacío si no hay notas
    }

    // 2. Obtener todos los IDs de usuarios únicos
    const userIds = [...new Set(notes.map(note => note.user))];
    
    // 3. Buscar todos los usuarios necesarios en una sola consulta
    const users = await User.find({ 
      _id: { $in: userIds.filter(id => id != null) } 
    }).lean().exec();

    // 4. Crear un mapa rápido de usuarios por ID
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {});

    // 5. Mapear las notas con sus usuarios
    const notesWithUsers = notes.map(note => {
      const user = note.user ? userMap[note.user.toString()] : null;
      return {
        ...note,
        username: user?.username || 'Usuario desconocido',
        userActive: user?.active || false
      };
    });

    res.json(notesWithUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las notas' });
  }
});

// @desc Crear una nueva nota
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
  const { title, text, completed = false } = req.body; // Agregado valor por defecto para completed

  // Validación mejorada
  if (!title?.trim() || !text?.trim()) {
    return res.status(400).json({ 
      message: 'Todos los campos son obligatorios',
      fields: { title: !title?.trim() ? 'Requerido' : 'Válido', 
                text: !text?.trim() ? 'Requerido' : 'Válido' }
    });
  }

  try {
    // Obtener el usuario del token
    const user = await User.findOne({ username: req.user }).exec();
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar duplicados (insensible a mayúsculas/minúsculas)
    const duplicate = await Note.findOne({ 
      user: user._id,
      title: { $regex: new RegExp(`^${title}$`, 'i') } 
    }).lean().exec();

    if (duplicate) {
      return res.status(409).json({ 
        message: 'Ya existe una nota con este título',
        existingNoteId: duplicate._id 
      });
    }

    // Crear la nota
    const note = await Note.create({ 
      user: user._id, 
      title: title.trim(),
      text: text.trim(),
      completed
    });

    // Respuesta enriquecida
    return res.status(201).json({
      success: true,
      message: 'Nota creada exitosamente',
      note: {
        id: note._id,
        title: note.title,
        createdAt: note.createdAt
      }
    });

  } catch (error) {
    console.error('Error al crear nota:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor al crear la nota',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc Actualizar una nota
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, title, text, completed } = req.body;

  // Validación mejorada
  if (!id || !title?.trim() || !text?.trim() || typeof completed !== "boolean") {
    return res.status(400).json({
      message: "Todos los campos son obligatorios",
      invalidFields: {
        id: !id ? "Requerido" : "Válido",
        title: !title?.trim() ? "Requerido" : "Válido",
        text: !text?.trim() ? "Requerido" : "Válido",
        completed: typeof completed !== "boolean" ? "Debe ser booleano" : "Válido",
      },
    });
  }

  try {
    // Obtener el usuario actual
    const currentUser = await User.findOne({ username: req.user }).exec();

    if (!currentUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const note = await Note.findById(id).exec();

    if (!note) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    // ✅ Corrección: Validar si el usuario es dueño de la nota o tiene rol de administrador
    if (note.user.toString() !== currentUser._id.toString() && !currentUser.roles.includes("Admin")) {
      return res.status(403).json({
        message: "No tienes permisos para editar esta nota",
      });
    }

    // Verificar duplicados (excluyendo la nota actual)
    const duplicate = await Note.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
      _id: { $ne: id },
    }).lean().exec();

    if (duplicate) {
      return res.status(409).json({
        message: "Ya existe otra nota con este título",
        conflictingNoteId: duplicate._id,
      });
    }

    // Actualizar la nota
    note.title = title.trim();
    note.text = text.trim();
    note.completed = completed;
    note.updatedAt = new Date();

    const updatedNote = await note.save();

    return res.json({
      success: true,
      message: "Nota actualizada exitosamente",
      note: {
        id: updatedNote._id,
        title: updatedNote.title,
        updatedAt: updatedNote.updatedAt,
        completed: updatedNote.completed,
      },
    });
  } catch (error) {
    console.error("Error al actualizar nota:", error);
    return res.status(500).json({
      message: "Error interno del servidor al actualizar la nota",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc Eliminar una nota
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirmar datos
  if (!id) {
    return res.status(400).json({ message: 'Se requiere identificación de nota' });
  }

  // Confirmar que la nota existe para eliminar
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: 'Nota no encontrada' });
  }

  const result = await note.deleteOne();

  const reply = `Nota '${result.title}' con el ID ${result._id} fue eliminada`;
  console.log("ID recibido:", id);
console.log("Nota encontrada:", note);

  res.json(reply);
});

// @desc Buscar notas
// @route GET /notes/search
// @access Private
const searchNotes = asyncHandler(async (req, res) => {
  try {
    const { title, text, startDate, endDate, completed, ticket, username } = req.query;
    const query = {};

    console.log('Parámetros de búsqueda recibidos:', req.query);

    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    if (text) {
      query.text = { $regex: text, $options: 'i' };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (completed !== undefined) {
      query.completed = completed === 'true';
    }

    if (ticket) {
      query.ticket = Number(ticket);
    }

    if (username) {
      const user = await User.findOne({ username: { $regex: username, $options: 'i' } }).lean().exec();
      if (user) {
        query.user = user._id;
      } else {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
    }

    const notes = await Note.find(query);
    console.log('Notas encontradas:', notes);
    res.status(200).json(notes);
  } catch (error) {
    console.error('Error en la búsqueda:', error);
    res.status(500).json({ message: 'Error al realizar la búsqueda' });
  }
});

export { getAllNotes, createNewNote, updateNote, deleteNote, searchNotes };
