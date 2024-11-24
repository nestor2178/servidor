import NewNoteForm from "./NewNoteForm";
import { useGetUsersQuery } from "../users/UsersApiSlice";
import PulseLoader from "react-spinners/PulseLoader";
import useTitle from "../../hooks/useTitle";
import { User } from "../users/User";
const NewNote = () => {
    useTitle("TechNotePro: New Note");

    const { users } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            users: data?.ids.map((id) => data?.entities[id]) as User[],
        }),
    });

    if (!users?.length) return <PulseLoader color={"#FFF"} />;

    const content = <NewNoteForm users={users} />;

    return content;
};
export default NewNote;
