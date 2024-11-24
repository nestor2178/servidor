import { useGetNotesQuery } from "./notesApiSlice";
import Note from "./Note";
import useAuth from "../../hooks/useAuth";
import useTitle from "../../hooks/useTitle";
import PulseLoader from "react-spinners/PulseLoader";

const NotesList = () => {
  useTitle("TechNotePro: Notes List");

  const { username, isManager, isAdmin } = useAuth();

  const {
    data: notes,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetNotesQuery("notesList", {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  let content;

  if (isLoading) content = <PulseLoader color={"#FFF"} />;

  if (isError) {
    content = (
      <p className="errmsg">
        {error && "message" in error
          ? error.message
          : "Se produjo un error desconocido"}
      </p>
    );
  }

  if (isSuccess) {
    const { ids, entities } = notes;

    let filteredIds: string[];
    if (isManager || isAdmin) {
      filteredIds = ids.map((id: any) => String(id)); // Convert to string
    } else {
      filteredIds = ids
        .filter(
          (noteId: string | number) =>
            entities[String(noteId)].username === username
        )
        .map((id: any) => String(id)); // Convert to string
    }

    const tableContent =
      ids?.length &&
      filteredIds.map((noteId: string) => (
        <Note key={noteId} noteId={noteId} />
      ));

    content = (
      <table className="table table--notes">
        <thead className="table__thead">
          <tr>
            <th scope="col" className="table__th note__status">
              Estado de la Nota
            </th>
            <th scope="col" className="table__th note__created">
              Creada
            </th>
            <th scope="col" className="table__th note__updated">
              Actualizada
            </th>
            <th scope="col" className="table__th note__title">
              Título
            </th>
            <th scope="col" className="table__th note__username">
              Dueño
            </th>
            <th scope="col" className="table__th note__edit">
              Editar
            </th>
          </tr>
        </thead>
        <tbody>{tableContent}</tbody>
      </table>
    );
  }

  return content;
};

export default NotesList;
