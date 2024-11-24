// EditNote.tsx
import { useParams } from "react-router-dom";
import EditNoteForm from "./EditNoteForm";
import { useGetNotesQuery } from "./notesApiSlice";
import { useGetUsersQuery } from "../users/UsersApiSlice";
import useAuth from "../../hooks/useAuth";
import PulseLoader from "react-spinners/PulseLoader";
import useTitle from "../../hooks/useTitle";

interface User {
    id: string;
    username: string;
}

interface Note {
    username: string;
    id: string;
    user: string;
    title: string;
    text: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
    ticket?: string; // Optional property if needed
}

const EditNote = () => {
    useTitle("TechNotePro: Edit Note");

    const { id } = useParams<{ id: string }>();
    const { username, isManager, isAdmin } = useAuth();

    const { note } = useGetNotesQuery("notesList", {
        selectFromResult: ({ data }) => ({
            note: id ? (data?.entities[id] as unknown as Note) : undefined,
        }),
    });

    const { users } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            users: data?.ids.map((id) => data?.entities[id] as User),
        }),
    });

    if (!note || !users?.length) return <PulseLoader color={"#FFF"} />;

    if (!isManager && !isAdmin && note.username !== username) {
        return <p className="errmsg">No access</p>;
    }

    return <EditNoteForm note={note} users={users} />;
};

export default EditNote;
