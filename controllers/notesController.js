import Note from "../models/Note.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";

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
    const userIds = [...new Set(notes.map((note) => note.user))];

    // 3. Buscar todos los usuarios necesarios en una sola consulta
    const users = await User.find({
      _id: { $in: userIds.filter((id) => id != null) },
    })
      .lean()
      .exec();

    // 4. Crear un mapa rápido de usuarios por ID
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {});

    // 5. Mapear las notas con sus usuarios
    const notesWithUsers = notes.map((note) => {
      const user = note.user ? userMap[note.user.toString()] : null;
      return {
        ...note,
        username: user?.username || "Usuario desconocido",
        userActive: user?.active || false,
      };
    });

    res.json(notesWithUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las notas" });
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
      message: "Todos los campos son obligatorios",
      fields: {
        title: !title?.trim() ? "Requerido" : "Válido",
        text: !text?.trim() ? "Requerido" : "Válido",
      },
    });
  }

  try {
    // Obtener el usuario del token
    // Usa el usuario enviado o el del token
    const userId = req.body.user || req.user;

    const user = await User.findById(userId).exec();

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar duplicados (insensible a mayúsculas/minúsculas)
    const duplicate = await Note.findOne({
      user: user._id,
      title: { $regex: new RegExp(`^${title}$`, "i") },
    })
      .lean()
      .exec();

    if (duplicate) {
      return res.status(409).json({
        message: "Ya existe una nota con este título",
        existingNoteId: duplicate._id,
      });
    }

    // Crear la nota
    const note = await Note.create({
      user: user._id,
      title: title.trim(),
      text: text.trim(),
      completed,
    });

    // Respuesta enriquecida
    return res.status(201).json({
      success: true,
      message: "Nota creada exitosamente",
      note: {
        id: note._id,
        title: note.title,
        createdAt: note.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al crear nota:", error);
    return res.status(500).json({
      message: "Error interno del servidor al crear la nota",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc Actualizar una nota
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  // 1. EXTRAER TODOS LOS CAMPOS NECESARIOS, INCLUYENDO EL NUEVO USUARIO ASIGNADO
  const { id, title, text, completed, user: assignedUserId } = req.body; // Añadido 'user' y lo renombro a 'assignedUserId' para claridad

  // --- INICIO DE LOGS PARA DEPURACIÓN (¡MUY RECOMENDADO!) ---
  console.log("--- Iniciando actualización de Nota ---");
  console.log("ID de la Nota a actualizar:", id);
  console.log(
    "Datos recibidos en req.body:",
    JSON.stringify(req.body, null, 2)
  );
  if (assignedUserId) {
    console.log("ID de usuario para reasignación recibido:", assignedUserId);
  } else {
    console.log(
      "No se recibió ID de usuario para reasignación en req.body.user."
    );
  }
  // --- FIN DE LOGS PARA DEPURACIÓN ---

  // Validación mejorada (el 'user' para reasignación es opcional, por lo que no se valida aquí estrictamente)
  if (
    !id ||
    (title !== undefined && !title.trim()) ||
    (text !== undefined && !text.trim()) ||
    (completed !== undefined && typeof completed !== "boolean")
  ) {
    // Ajusta la validación según si todos los campos son siempre obligatorios o si es una actualización parcial
    return res.status(400).json({
      message: "Algunos campos obligatorios faltan o son inválidos",
      // ... puedes detallar invalidFields si lo deseas
    });
  }

  try {
    const currentUser = await User.findOne({ username: req.user })
      .lean()
      .exec(); // .lean() es bueno si solo lees

    if (!currentUser) {
      return res
        .status(404)
        .json({ message: "Usuario actual (autenticado) no encontrado" });
    }

    const note = await Note.findById(id).exec();

    if (!note) {
      return res.status(404).json({ message: "Nota no encontrada" });
    }

    // Permisos para editar la nota en general (dueño o Admin)
    const isOwner = note.user.toString() === currentUser._id.toString();
    const isAdmin = currentUser.roles.includes("Admin");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "No tienes permisos para editar esta nota",
      });
    }

    // Si se proporciona 'assignedUserId' y es diferente al actual, se intenta reasignar
    if (assignedUserId && note.user.toString() !== assignedUserId) {
      // Lógica de permisos para REASIGNAR la nota:
      // Ejemplo: Solo un Admin puede reasignar una nota a un usuario diferente.
      // O: Un Admin puede reasignar cualquier nota, el dueño solo puede reasignar SU nota.
      // Por ahora, vamos a permitir que el Admin reasigne, o que el dueño reasigne su propia nota.
      // Si el dueño no puede reasignar (solo Admin), la condición sería más simple: if (!isAdmin) ...

      // Verificar si el usuario que reasigna tiene permiso (ya cubierto por isAdmin o isOwner)
      // Y adicionalmente, verificar si el 'assignedUserId' es un usuario válido
      const newAssignedUserExists = await User.findById(assignedUserId)
        .lean()
        .exec();
      if (!newAssignedUserExists) {
        return res.status(400).json({
          message: "El usuario al que se intenta asignar la nota no existe.",
        });
      }
      console.log(
        `Reasignando nota ${note._id} del usuario ${note.user} al usuario ${assignedUserId}`
      );
      note.user = assignedUserId; // <--- ¡AQUÍ SE ACTUALIZA EL USUARIO!
    } else if (assignedUserId && note.user.toString() === assignedUserId) {
      console.log(
        "La nota ya está asignada a este usuario. No se requiere reasignación."
      );
    }

    // Actualizar otros campos si se proporcionan
    if (title !== undefined) note.title = title.trim();
    if (text !== undefined) note.text = text.trim();
    if (completed !== undefined) note.completed = completed;

    // Solo actualiza updatedAt si hay cambios reales o si siempre quieres actualizarlo.
    // Si solo actualizas cuando hay cambios, necesitarías comparar los valores antiguos y nuevos.
    // Por simplicidad, lo actualizaremos si la función es llamada.
    note.updatedAt = new Date();

    // Verificar duplicados de título (excluyendo la nota actual) solo si el título cambió
    if (title !== undefined && note.isModified("title")) {
      // isModified es un método de Mongoose
      const duplicate = await Note.findOne({
        title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
        _id: { $ne: id },
        user: note.user, // Considera si el título duplicado debe ser por usuario o global
      })
        .lean()
        .exec();

      if (duplicate) {
        return res.status(409).json({
          message:
            "Ya existe otra nota con este título para el usuario asignado",
          conflictingNoteId: duplicate._id,
        });
      }
    }

    const updatedNote = await note.save();
    console.log(
      "Nota guardada exitosamente:",
      JSON.stringify(updatedNote, null, 2)
    );
    console.log("--- Fin actualización de Nota ---");

    return res.json({
      success: true,
      message: "Nota actualizada exitosamente",
      note: updatedNote, // Devuelve la nota completa actualizada
    });
  } catch (error) {
    console.error("Error al actualizar nota:", error);
    console.log("--- Fin actualización de Nota con Error ---");
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
    return res
      .status(400)
      .json({ message: "Se requiere identificación de nota" });
  }

  // Confirmar que la nota existe para eliminar
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Nota no encontrada" });
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
    const { title, text, startDate, endDate, completed, ticket, username } =
      req.query;
    const query = {};

    console.log("Parámetros de búsqueda recibidos:", req.query);

    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    if (text) {
      query.text = { $regex: text, $options: "i" };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (completed !== undefined) {
      query.completed = completed === "true";
    }

    if (ticket) {
      query.ticket = Number(ticket);
    }

    if (username) {
      const user = await User.findOne({
        username: { $regex: username, $options: "i" },
      })
        .lean()
        .exec();
      if (user) {
        query.user = user._id;
      } else {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
    }

    const notes = await Note.find(query);
    console.log("Notas encontradas:", notes);
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error en la búsqueda:", error);
    res.status(500).json({ message: "Error al realizar la búsqueda" });
  }
});

export { getAllNotes, createNewNote, updateNote, deleteNote, searchNotes };
