import translateRole, { Role } from "../../config/roleTranslations";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useGetUsersQuery } from '../users/UsersApiSlice';
import { memo } from 'react';

interface UserProps {
    userId: string;
}

export interface User {
    id: string;
    username: string;
    roles: string[];
    active: boolean;
}

const User: React.FC<UserProps> = ({ userId }) => {
    const { data } = useGetUsersQuery("usersList");

    // Asegúrate de que data.entities sea del tipo correcto
    const user = data?.entities && (data.entities[userId] as User);

    const navigate = useNavigate();

    if (user) {
        const handleEdit = () => navigate(`/dash/users/${userId}`);

        // Traducir los roles antes de convertirlos en string
        const userRolesString = Array.isArray(user.roles)
            ? user.roles.map(role => translateRole(role as Role)).join(", ")
            : "";

        const cellStatus = user.active ? "" : "table__cell--inactive";

        return (
            <tr className={`table__row user ${cellStatus}`}>
                <td className="table__cell">{user.username}</td>
                <td className="table__cell">{userRolesString}</td>
                <td className="table__cell">
                    <button className="icon-button table__button" onClick={handleEdit}>
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                </td>
            </tr>
        );
    } else {
        return null;
    }
};

const memoizedUser = memo(User);

export default memoizedUser;
