import * as chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server.js'; // Cambia esto si el servidor está en otra ruta

chai.use(chaiHttp);
const { expect } = chai;

let token;
let noteId;

before((done) => {
  // Autenticación previa para obtener el token
  chai.request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'password123' })
    .end((err, res) => {
      token = res.body.token;
      done();
    });
});

describe('Pruebas de Notas', () => {
  it('Debería crear una nueva nota', (done) => {
    const note = {
      title: 'Nota de prueba',
      content: 'Contenido de la nota',
    };

    chai.request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(note)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('message').eql('Nota creada exitosamente');
        // Guardamos el ID de la nota para usarla en la eliminación
        noteId = res.body.note.id;
        done();
      });
  });

  it('Debería obtener todas las notas', (done) => {
    chai.request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });

  it('Debería eliminar una nota', (done) => {
    chai.request(app)
      .delete(`/api/notes/${noteId}`) // Usamos el ID obtenido anteriormente
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message').eql('Nota eliminada exitosamente');
        done();
      });
  });
});
