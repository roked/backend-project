// API Integration Testing with Jest and Supertest - Message History endpoints
import request from 'supertest';
import mongoose from 'mongoose';
import History from '../models/msghistory.js';
import app from '../app';

const databaseName = 'testHistory';

// Before each test connect to a Mongo DB
beforeAll(async () => {
  const url = `mongodb://127.0.0.1/${databaseName}`;
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
});

// Cleans up database between each test
afterEach(async () => {
  await History.deleteMany();
});

// Disconnect Mongoose
afterAll(async () => {
  await mongoose.connection.close();
});

// Send message
describe('Send message', () => {
  it('should send a message', async () => {
    const res = await request(app.callback())
      .post('/api/message/new')
      .send({
        receiver: 'donchevm',
        msg: 'Test',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Message send!');
  });
});

// Try to send message without receiver
describe('No receiver', () => {
  it('should throw an error', async () => {
    const res = await request(app.callback())
      .post('/api/message/new')
      .send({
        receiver: '',
        msg: 'Test',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'This message cannot be send!');
  });
});

// Try to send empty message
describe('Empty message', () => {
  it('should throw an error', async () => {
    const res = await request(app.callback())
      .post('/api/message/new');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'This message cannot be send!');
  });
});

// Send two messages same receiver
describe('Multy messages', () => {
  it('should send two messages', async () => {
    let res = await request(app.callback())
      .post('/api/message/new')
      .send({
        receiver: 'donchevm',
        msg: 'Test',
      });

    res = await request(app.callback())
      .post('/api/message/new')
      .send({
        receiver: 'donchevm',
        msg: 'Test',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Message send!');
  });
});

// Get message history
describe('Get messages', () => {
  it('should get message history', async () => {
    let res = await request(app.callback())
      .post('/api/message/new')
      .send({
        receiver: 'testUser',
        msg: 'Test',
      });

    res = await request(app.callback())
      .get('/api/message/get');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Your message history!');
  });
});

// Get message empty history
describe('No new messages', () => {
  it('should not get any messages', async () => {
    const res = await request(app.callback())
      .get('/api/message/get');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Inbox is empty!');
  });
});

// Delete message
describe('Delete messages', () => {
  it('should delete message', async () => {
    let res = await request(app.callback())
      .post('/api/message/new')
      .send({
        receiver: 'testUser',
        msg: 'Test',
      });
    res = await request(app.callback())
      .delete('/api/message/1');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Message deleted!');
  });
});

// Try to delete nonexisting message
describe('Delete nonexisting messages', () => {
  it('should throw an error', async () => {
    let res = await request(app.callback())
      .post('/api/message/new')
      .send({
        receiver: 'testUser',
        msg: 'Test',
      });
    res = await request(app.callback())
      .delete('/api/message/2');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'This message cannot be deleted!');
  });
});
