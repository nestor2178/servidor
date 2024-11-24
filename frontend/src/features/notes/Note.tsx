import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useGetNotesQuery } from "./notesApiSlice";
import { memo } from "react";

// Definición de la interfaz Note
interface Note {
  id: string;
  title: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  username: string;
  completed: boolean;
}

// Definición de la interfaz NoteProps
interface NoteProps {
  noteId: string;
}

// Componente Note
const Note = ({ noteId }: NoteProps) => {
  const { note } = useGetNotesQuery("notesList", {
    selectFromResult: ({ data }) => ({
      note: data?.entities[noteId] as Note | undefined,
    }),
  });

  const navigate = useNavigate();

  if (note) {
    const created = new Date(note.createdAt).toLocaleString("es-CO", {
      day: "numeric",
      month: "long",
    });

    const updated = new Date(note.updatedAt).toLocaleString("es-CO", {
      day: "numeric",
      month: "long",
    });

    const handleEdit = () => navigate(`/dash/notes/${noteId}`);

    return (
      <tr className="table__row">
        <td className="table__cell note__status">
          {note.completed ? (
            <span className="note__status--completed">Terminada</span>
          ) : (
            <span className="note__status--open">Abierta</span>
          )}
        </td>
        <td className="table__cell note__created">{created}</td>
        <td className="table__cell note__updated">{updated}</td>
        <td className="table__cell note__title">{note.title}</td>
        <td className="table__cell note__username">{note.username}</td>

        <td className="table__cell">
          <button className="icon-button table__button" onClick={handleEdit}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
        </td>
      </tr>
    );
  } else return null;
};

// Memoización del componente Note
const memoizedNote = memo(Note);

export default memoizedNote;
