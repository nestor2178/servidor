import * as chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server.js'; // Ruta correcta a tu archivo server.js

chai.use(chaiHttp);
const { expect } = chai;

describe('Test de autenticación', () => {
  it('Debería fallar con credenciales inválidas', async () => {
    const res = await chai.request(app) // Esto debe funcionar si la importación es correcta
      .post('/auth/login') // Ruta de autenticación (ajusta según tu ruta real)
      .send({ username: 'admin', password: 'wrongpassword' });

    expect(res).to.have.status(401);
    expect(res.body.message).to.equal('Invalid credentials');
  });
});


  it('Debería fallar con credenciales inválidas', (done) => {
    const user = {
      username: 'admin',
      password: 'wrongpassword',
    };

    chai.request(app)
      .post('/api/auth/login')
      .send(user)
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('message').eql('Credenciales inválidas');
        done();
      });
  });

