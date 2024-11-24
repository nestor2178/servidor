import { useState, useEffect, SetStateAction } from "react";
import { useAddNewUserMutation } from "./UsersApiSlice";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { ROLES } from "../../config/roles";
import useTitle from "../../hooks/useTitle";
import translateRole from "../../config/roleTranslations";

const USER_REGEX = /^[A-z]{3,20}$/;
const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/;

const NewUserForm = () => {
  useTitle("TechNotePro: New User");

  const [addNewUser, { isLoading, isSuccess, isError, error }] = useAddNewUserMutation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [validUsername, setValidUsername] = useState(false);
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [role, setRole] = useState("Employee"); // Usamos 'role' en singular para evitar confusión

  useEffect(() => {
    setValidUsername(USER_REGEX.test(username));
  }, [username]);

  useEffect(() => {
    setValidPassword(PWD_REGEX.test(password));
  }, [password]);

  useEffect(() => {
    if (isSuccess) {
      setUsername("");
      setPassword("");
      setRole("Employee"); // Resetea a un valor escalar
      navigate("/dash/users");
    }
  }, [isSuccess, navigate]);

  const onUsernameChanged = (e: { target: { value: SetStateAction<string> }; }) => setUsername(e.target.value);
  const onPasswordChanged = (e: { target: { value: SetStateAction<string> }; }) => setPassword(e.target.value);
  const onRoleChanged = (e: { target: { value: SetStateAction<string> }; }) => setRole(e.target.value);

  const canSave = [role, validUsername, validPassword].every(Boolean) && !isLoading;

  const onSaveUserClicked = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (canSave) {
      await addNewUser({ username, password, roles: [role] }); // Asegura que 'roles' sea un array al enviar
    }
  };

  const options = Object.values(ROLES).map((role) => (
    <option key={role} value={role}>
      {translateRole(role)}
    </option>
  ));

  const errClass = isError ? "errmsg" : "offscreen";
  let errMsg = "";
  if (isError) {
    if ("data" in error) {
      errMsg = (error as any)?.data?.message || "";
    } else {
      errMsg = (error as any)?.message || "Error desconocido";
    }
  }

  const validUserClass = !validUsername ? "form__input--incomplete" : "";
  const validPwdClass = !validPassword ? "form__input--incomplete" : "";
  const validRoleClass = !role ? "form__input--incomplete" : "";

  const content = (
    <>
      <p className={errClass}>{errMsg}</p>
      <form className="form" onSubmit={onSaveUserClicked}>
        <div className="form__title-row">
          <h2>Nuevo Usuario</h2>
          <div className="form__action-buttons">
            <button className="icon-button" title="Guardar" disabled={!canSave}>
              <FontAwesomeIcon icon={faSave} />
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
          autoComplete="username"
          value={username}
          onChange={onUsernameChanged}
        />
        <label className="form__label" htmlFor="password">
          Contraseña:{" "}
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
        <label className="form__label" htmlFor="roles">
          ROLES ASIGNADOS:
        </label>
        <select
          id="roles"
          name="roles"
          className={`form__select ${validRoleClass}`}
          value={role} // Asegura que el valor sea escalar
          onChange={onRoleChanged}
        >
          {options}
        </select>
      </form>
    </>
  );

  return content;
};

export default NewUserForm;
