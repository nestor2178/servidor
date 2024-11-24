import { useGetUsersQuery } from "../users/UsersApiSlice";
import User from "./User";
import useTitle from "../../hooks/useTitle";
import PulseLoader from "react-spinners/PulseLoader";

const UsersList = () => {
  useTitle("techNotes: Users List");

  const {
    data: users,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetUsersQuery("usersList", {
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  let content;

  if (isLoading) content = <PulseLoader color={"#FFF"} />;

  if (isError) {
    let errMsg: string;

    if ('data' in error) {
      errMsg = (error.data as { message?: string })?.message || "Unknown error";
    } else if ('error' in error) {
      errMsg = error.error;
    } else {
      errMsg = JSON.stringify(error);
    }

    content = <p className="errmsg">{errMsg}</p>;
  }

  if (isSuccess) {
    const { ids } = users;

    const tableContent = ids?.length
      && ids.filter((id): id is string => !!id)
        .map((userId) => <User key={userId} userId={userId} />);

    content = (
      <table className="table table--users">
        <thead className="table__thead">
          <tr>
            <th scope="col" className="table__th user__username">
              Nombre de Usuario
            </th>
            <th scope="col" className="table__th user__roles">
              Roles
            </th>
            <th scope="col" className="table__th user__edit">
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

export default UsersList;
