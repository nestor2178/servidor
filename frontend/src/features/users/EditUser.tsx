//EditUser.tsx
import { useParams } from 'react-router-dom'
import EditUserForm from './EditUserForm'
import { useGetUsersQuery } from './UsersApiSlice'
import PulseLoader from 'react-spinners/PulseLoader'
import useTitle from '../../hooks/useTitle'
import { User } from './User'

const EditUser = () => {
    useTitle("TechNotePro: Edit User");

    const { id } = useParams();

    if (!id) {
        return <PulseLoader color={"#FFF"} />;
    }

    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[id] as User, // Asegúrate de que el tipo sea User
        }),
    });

    if (!user) return <PulseLoader color={"#FFF"} />;

    const content = <EditUserForm user={user} />;

    return content;
};

export default EditUser;
