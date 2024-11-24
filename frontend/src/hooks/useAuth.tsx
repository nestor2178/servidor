import { useSelector } from 'react-redux'
import { selectCurrentToken } from "../features/auth/authSlice"
import { jwtDecode } from 'jwt-decode';

// Define la estructura del payload del JWT
interface UserInfo {
    username: string;
    roles: any[];
}
interface CustomJwtPayload {
    UserInfo: UserInfo;
}


const useAuth = () => {
    const token = useSelector(selectCurrentToken)

    const defaultAuthState = {
        username: '',
        roles: [],
        isManager: false,
        isAdmin: false,
        status: "Employee"
    }

    if (!token) {
        return defaultAuthState;
    }

    const decoded = jwtDecode<CustomJwtPayload>(token);
    const { username, roles } = decoded.UserInfo

    const isManager = roles.includes('Manager')
    const isAdmin = roles.includes('Admin')

    const status = isManager ? "Manager" : isAdmin ? "Admin" : "Employee"

    return { username, roles, status, isManager, isAdmin }
}

export default useAuth
