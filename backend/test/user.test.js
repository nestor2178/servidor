import * as chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server.js'; // Cambia esto si el servidor está en otra ruta

chai.use(chaiHttp);
const { expect } = chai;

let token;
let userId;

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

describe('Pruebas de Gestión de Usuarios', () => {
  it('Debería crear un nuevo usuario', (done) => {
    const newUser = {
      username: 'newuser',
      password: 'password123',
      role: 'Employee',
    };

    chai.request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send(newUser)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('message').eql('Usuario creado exitosamente');
        expect(res.body).to.have.property('user');
        expect(res.body.user).to.have.property('username').eql(newUser.username);
        expect(res.body.user).to.have.property('role').eql(newUser.role);
        userId = res.body.user._id; // Guardar el ID del usuario para eliminarlo después
        done();
      });
  });

  it('Debería obtener todos los usuarios', (done) => {
    chai.request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length.greaterThan(0); // Asegurarse de que hay usuarios en la lista
        done();
      });
  });

  after((done) => {
    // Eliminar el usuario creado para mantener el entorno de pruebas limpio
    chai.request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message').eql('Usuario eliminado exitosamente');
        done();
      });
  });
});
