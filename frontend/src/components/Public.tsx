import { Link } from "react-router-dom";

const Public = () => {
  const content = (
    <section className="public">
      <header>
        <h1>
          Bienvenido a <span className="nowrap">MC Tecnologías</span>
        </h1>
      </header>
      <main className="public__main">
        <p>
          Ubicados en el corazón de Cali, en MC Tecnologías somos expertos en soluciones técnicas
          y reparación de todo tipo de equipos electrónicos. Ya sea que necesites asistencia para
          televisores, lavadoras, equipos de cómputo o celulares, nuestro equipo altamente capacitado
          está listo para ofrecerte un servicio rápido, confiable y profesional.
        </p>
        <address className="public__addr">
          MC. TECNOLOGIAS
          <br />
          Calle 72Hbis 28e - 60
          <br />
          Cali Valle
          <br />
          <a href="tel:+573143934875" className="text-info">(314) 393-4875</a>
        </address>
        <br />
        <p>Propietario: Miguel Angel Campuzano</p>
      </main>
      <footer>
        <Link to="/login" className="btn btn-primary">Login Empleados</Link>
      </footer>
    </section>
  );
  return content;
};

export default Public;
