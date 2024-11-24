//EditUserForm.tsx
import { useState, useEffect } from "react";
import { useUpdateUserMutation, useDeleteUserMutation } from "./UsersApiSlice";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { ROLES } from "../../config/roles";
import translateRole from "../../config/roleTranslations";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const USER_REGEX = /^[A-z]{3,20}$/;
const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/;

interface User {
  id: string;
  username: string;
  roles: string[];
  active: boolean;
}

interface EditUserFormProps {
  user: User;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user }) => {
  const [updateUser, { isLoading, isSuccess, isError, error }] =
    useUpdateUserMutation();

  const [
    deleteUser,
    { isSuccess: isDelSuccess, isError: isDelError, error: delerror },
  ] = useDeleteUserMutation();

  const navigate = useNavigate();

  const [username, setUsername] = useState(user.username);
  const [validUsername, setValidUsername] = useState(false);
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [roles, setRoles] = useState(user.roles || []);
  const [active, setActive] = useState(user.active);

  useEffect(() => {
    setValidUsername(USER_REGEX.test(username));
  }, [username]);

  useEffect(() => {
    setValidPassword(PWD_REGEX.test(password));
  }, [password]);

  useEffect(() => {
    if (isSuccess || isDelSuccess) {
      setUsername("");
      setPassword("");
      setRoles([]);
      navigate("/dash/users");
    }
  }, [isSuccess, isDelSuccess, navigate]);

  const onUsernameChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUsername(e.target.value);
  const onPasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);

  const onRolesChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(
      e.target.selectedOptions,
      (option) => (option as HTMLOptionElement).value
    );
    setRoles(values);
  };

  const onActiveChanged = () => setActive((prev) => !prev);

  const onSaveUserClicked = async () => {
    try {
      if (password) {
        await updateUser({ id: user.id, username, password, roles, active });
      } else {
        await updateUser({ id: user.id, username, roles, active });
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const onDeleteUserClicked = async () => {
    try {
      await deleteUser({ id: user.id });
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const options = Object.values(ROLES).map((role) => (
    <option key={role} value={role}>
      {translateRole(role)}
    </option>
  ));

  let canSave;
  if (password) {
    canSave = roles.length > 0 && validUsername && validPassword && !isLoading;
  } else {
    canSave = roles.length > 0 && validUsername && !isLoading;
  }

  const errClass = isError || isDelError ? "errmsg" : "offscreen";
  const validUserClass = !validUsername ? "form__input--incomplete" : "";
  const validPwdClass =
    password && !validPassword ? "form__input--incomplete" : "";
  const validRolesClass = roles.length === 0 ? "form__input--incomplete" : "";

  const getErrorMessage = (error: FetchBaseQueryError | undefined) => {
    if (error && "data" in error && typeof error.data === "object" && error.data !== null) {
      return (error.data as { message?: string }).message || "";
    }
    return "";
  };

  const errContent =
    getErrorMessage(error as FetchBaseQueryError) ||
    getErrorMessage(delerror as FetchBaseQueryError);

  return (
    <>
      <p className={errClass}>{errContent}</p>

      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <div className="form__title-row">
          <h2>Editar Usuario</h2>
          <div className="form__action-buttons">
            <button
              className="icon-button"
              title="Guardar"
              onClick={onSaveUserClicked}
              disabled={!canSave}
            >
              <FontAwesomeIcon icon={faSave} />
            </button>
            <button
              className="icon-button"
              title="Eliminar"
              onClick={onDeleteUserClicked}
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
          </div>
        </div>
        <label className="form__label" htmlFor="username">
          Nombre de Usuario: <span className="nowrap">[3-20 letras]</span>
        </label>
        <input
          className={`form__input ${validUserClass}`}
          id="username"
          name="username"
          type="text"
          autoComplete="off"
          value={username}
          onChange={onUsernameChanged}
        />

        <label className="form__label" htmlFor="password">
          Contraseña: <span className="nowrap">[Vacía = sin cambio]</span>{" "}
          <span className="nowrap">[4-12 caracteres incluidos. !@#$%]</span>
        </label>
        <input
          className={`form__input ${validPwdClass}`}
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={onPasswordChanged}
          autoComplete="current-password"
        />

        <label
          className="form__label form__checkbox-container"
          htmlFor="user-active"
        >
          ACTIVO:
          <input
            className="form__checkbox"
            id="user-active"
            name="user-active"
            type="checkbox"
            checked={active}
            onChange={onActiveChanged}
          />
        </label>

        <label
          className="form__label form__checkbox-container"
          htmlFor="roles">
          FUNCIONES ASIGNADAS:
        </label>
        <select
          id="roles"
          name="roles"
          className={`form__select ${validRolesClass}`}
          value={roles}
          onChange={onRolesChanged}
        >
          {options}
        </select>
      </form>
    </>
  );
};

export default EditUserForm;
