import express from 'express';
import { getAllNotes, createNewNote, updateNote, deleteNote, searchNotes } from '../controllers/notesController.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = express.Router();

router.use(verifyJWT);

router
  .route('/')
  .get(getAllNotes)
  .post(createNewNote)
  .patch(updateNote)
  .delete(deleteNote);

  // Ruta para búsqueda avanzada 
router.get('/search', searchNotes);

export default router;
