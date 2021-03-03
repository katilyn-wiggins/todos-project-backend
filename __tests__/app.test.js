require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async (done) => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app).post('/auth/signup').send({
        email: 'jon@user.com',
        password: '1234'
      });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll((done) => {
      return client.end(done);
    });

    const newTodo = {
      todo: 'change the bathroom lightbulb',
      completed: false
    };

    const addedTodo = {
      ...newTodo,
      id: 3,
      owner_id: 2
    };

    const changedTodo = {
      todo: 'wash clothes',
      completed: true,
      id: 3,
      owner_id: 2
    };

    //POST
    test('creates a new todo', async () => {
      const newTodo = {
        todo: 'change the bathroom lightbulb',
        completed: false
      };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(newTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(addedTodo);
    });

    //GET
    test('returns all todos for a given user', async () => {
      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([addedTodo]);
    });

    //PUT
    test('updates a todo given an id', async () => {
      const updatedTodo = {
        todo: 'wash clothes',
        completed: true
      };

      const data = await fakeRequest(app)
        .put('/api/todos/3')
        .send(updatedTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(changedTodo);
    });
  });
});
