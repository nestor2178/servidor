import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useTitle from "../../hooks/useTitle";

const Welcome = () => {
  const { username, isManager, isAdmin } = useAuth();

  useTitle(`TechNotePro: ${username}`);

  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long" as "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "America/Bogota",// Ajustar la zona horaria según tus necesidades
  };
  const today = new Intl.DateTimeFormat("es-CO", options).format(date);

  const content = (
    <section className="welcome">
      <p>{today}</p>

      <h1>Bienvenido: {username}</h1>

      <p>
        <Link to="/dash/notes">Ver notas técnicas</Link>
      </p>

      <p>
        <Link to="/dash/notes/new">Agregar nueva nota técnica</Link>
      </p>

      {(isManager || isAdmin) && (
        <p>
          <Link to="/dash/users">Ver configuración de usuario</Link>
        </p>
      )}

      {(isManager || isAdmin) && (
        <p>
          <Link to="/dash/users/new">Agregar nuevo usuario</Link>
        </p>
      )}
    </section>
  );

  return content;
};
export default Welcome;
