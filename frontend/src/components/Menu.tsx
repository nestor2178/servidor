// Menu.tsx
const Menu = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <a className="navbar-brand" href="/">TechNotePro</a>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <a className="nav-link" href="/">Inicio</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/users">Usuarios</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/notes">Notas</a>
          </li>
        </ul>
      </div>
    </nav>

  );
};

export default Menu;
