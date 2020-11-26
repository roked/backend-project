// API Integration Testing with Jest and Supertest - Property endpoints
import request from 'supertest';
import mongoose from 'mongoose';
import Property from '../models/property.js';
import app from '../app';

const databaseName = 'testProperty';

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
  await Property.deleteMany();
});

// Disconnect Mongoose
afterAll(async () => {
  await mongoose.connection.close();
});

// Create new property
describe('Create new property', () => {
  it('should create new property', async () => {
    const res = await request(app.callback())
      .post('/api/property/new')
      .field('Content-Type', 'multipart/form-data')
      .field('name', 'Test Property')
      .field('price', '500000')
      .field('description', 'Test')
      .field('category', 'house')
      .field('status', 'new')
      .field('location', 'test')
      .field('features', ['true', 'false', 'false', 'false', 'false'])
      .attach('file', '');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'New property successfully saved!');
  });
});

// Try to duplicate properties
describe('Duplicate property', () => {
  it('should throw error', async () => {
    let res = await request(app.callback())
      .post('/api/property/new')
      .field('Content-Type', 'multipart/form-data')
      .field('name', 'Test Property')
      .field('price', '500000')
      .field('description', 'Test')
      .field('category', 'house')
      .field('status', 'new')
      .field('location', 'test')
      .field('features', ['true', 'false', 'false', 'false', 'false'])
      .attach('file', '');

    res = await request(app.callback())
      .post('/api/property/new')
      .field('Content-Type', 'multipart/form-data')
      .field('name', 'Test Property')
      .field('price', '500000')
      .field('description', 'Test')
      .field('category', 'house')
      .field('status', 'new')
      .field('location', 'test')
      .field('features', ['true', 'false', 'false', 'false', 'false'])
      .attach('file', '');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Property name already in use!');
  });
});

// Try to create property with missing information
describe('Missing information', () => {
  it('should throw error', async () => {
    const res = await request(app.callback())
      .post('/api/property/new')
      .field('Content-Type', 'multipart/form-data')
      .attach('file', '');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Missing information!');
  });
});

// View all properties with one valid property
describe('Load properties', () => {
  it('should get all properties', async () => {
    let res = await request(app.callback())
      .post('/api/property/new')
      .field('Content-Type', 'multipart/form-data')
      .field('name', 'Test Property')
      .field('price', '500000')
      .field('description', 'Test')
      .field('category', 'house')
      .field('status', 'new')
      .field('location', 'test')
      .field('features', ['true', 'false', 'false', 'false', 'false'])
      .attach('file', '');
    res = await request(app.callback())
      .post('/api/property/show');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'All properties loaded!');
  });
});

// View all properties when no properties
describe('No properties', () => {
  it('should get no properties', async () => {
    const res = await request(app.callback())
      .post('/api/property/show');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'No properties to show!');
  });
});

// Get property
describe('Load single property', () => {
  it('should get a property info', async () => {
    let res = await request(app.callback())
      .post('/api/property/new')
      .field('Content-Type', 'multipart/form-data')
      .field('name', 'Test Property')
      .field('price', '500000')
      .field('description', 'Test')
      .field('category', 'house')
      .field('status', 'new')
      .field('location', 'test')
      .field('features', ['true', 'false', 'false', 'false', 'false'])
      .attach('file', '');
    res = await request(app.callback())
      .get('/api/property/1');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Property loaded!');
  });
});

// Try to get nonexistent property
describe('Nonexistent property', () => {
  it('should throw an error', async () => {
    const res = await request(app.callback())
      .get('/api/property/1');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Something went wrong on requesting the property!');
  });
});

// Get property for edit property
describe('Load property for edit', () => {
  it('should get a property info', async () => {
    let res = await request(app.callback())
      .post('/api/property/new')
      .field('Content-Type', 'multipart/form-data')
      .field('name', 'Test Property')
      .field('price', '500000')
      .field('description', 'Test')
      .field('category', 'house')
      .field('status', 'new')
      .field('location', 'test')
      .field('features', ['true', 'false', 'false', 'false', 'false'])
      .attach('file', '');
    res = await request(app.callback())
      .get('/api/property/show/1/edit');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Property loaded!');
  });
});

// Try to get nonexistent property for edit
describe('Get nonexistent property for edit', () => {
  it('should throw an error', async () => {
    let res = await request(app.callback())
      .post('/api/property/new')
      .field('Content-Type', 'multipart/form-data')
      .field('name', 'Test Property')
      .field('price', '500000')
      .field('description', 'Test')
      .field('category', 'house')
      .field('status', 'new')
      .field('location', 'test')
      .field('features', ['true', 'false', 'false', 'false', 'false'])
      .attach('file', '');
    res = await request(app.callback())
      .get('/api/property/show/2/edit');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Something went wrong on requesting the property!');
  });
});

// Update property
describe('Update existing property', () => {
  it('should update the property', async () => {
    let res = await request(app.callback())
      .post('/api/property/new')
      .field('Content-Type', 'multipart/form-data')
      .field('name', 'Test Property')
      .field('price', '500000')
      .field('description', 'Test')
      .field('category', 'house')
      .field('status', 'new')
      .field('location', 'test')
      .field('features', ['true', 'false', 'false', 'false', 'false'])
      .attach('file', '');

    res = await request(app.callback())
      .put('/api/property/show/1')
      .field('Content-Type', 'multipart/form-data')
      .field('name', 'Test Property')
      .field('price', '100000')
      .field('description', 'Test')
      .field('category', 'house')
      .field('status', 'new')
      .field('location', 'test')
      .field('features', ['true', 'false', 'true', 'false', 'false'])
      .attach('file', '');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Property updated!');
  });
});

// Try to update nonexisting property
describe('Update nonexisting property', () => {
  it('should throw error', async () => {
    let res = await request(app.callback())
      .post('/api/property/new')
      .field('Content-Type', 'multipart/form-data')
      .field('name', 'Test Property')
      .field('price', '500000')
      .field('description', 'Test')
      .field('category', 'house')
      .field('status', 'new')
      .field('location', 'test')
      .field('features', ['true', 'false', 'false', 'false', 'false'])
      .attach('file', '');

    res = await request(app.callback())
      .put('/api/property/show/2')
      .field('Content-Type', 'multipart/form-data')
      .field('name', 'Test Property')
      .field('price', '100000')
      .field('description', 'Test')
      .field('category', 'house')
      .field('status', 'new')
      .field('location', 'test')
      .field('features', ['true', 'false', 'true', 'false', 'false'])
      .attach('file', '');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Something went wrong with the update!');
  });
});

// Delete property
describe('Delete property', () => {
  it('should delete a property', async () => {
    let res = await request(app.callback())
      .post('/api/property/new')
      .field('Content-Type', 'multipart/form-data')
      .field('name', 'Test Property')
      .field('price', '500000')
      .field('description', 'Test')
      .field('category', 'house')
      .field('status', 'new')
      .field('location', 'test')
      .field('features', ['true', 'false', 'false', 'false', 'false'])
      .attach('file', '');
    res = await request(app.callback())
      .delete('/api/property/delete/1');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Property deleted successfully!');
  });
});

// Try to delete nonexisting property
describe('Delete nonexisting property', () => {
  it('should throw an error', async () => {
    let res = await request(app.callback())
      .post('/api/property/new')
      .field('Content-Type', 'multipart/form-data')
      .field('name', 'Test Property')
      .field('price', '500000')
      .field('description', 'Test')
      .field('category', 'house')
      .field('status', 'new')
      .field('location', 'test')
      .field('features', ['true', 'false', 'false', 'false', 'false'])
      .attach('file', '');
    res = await request(app.callback())
      .delete('/api/property/delete/2');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'This property cannot be removed!');
  });
});

// try to edit property without authorization
describe('Not property owner edit', () => {
  it('should throw an error', async () => {
    let res = await request(app.callback())
      .post('/api/property/new')
      .field('Content-Type', 'multipart/form-data')
      .field('name', 'Test Property')
      .field('price', '500000')
      .field('description', 'Test')
      .field('category', 'house')
      .field('status', 'new')
      .field('location', 'test')
      .field('features', ['true', 'false', 'false', 'false', 'false'])
      .attach('file', '');
    res = await request(app.callback())
      .get('/api/property/show/3/edit');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Something went wrong during owner verification!');
  });
});

// try to delete property without authorization
describe('Not property owner delete', () => {
  it('should throw an error', async () => {
    let res = await request(app.callback())
      .post('/api/property/new')
      .field('Content-Type', 'multipart/form-data')
      .field('name', 'Test Property')
      .field('price', '500000')
      .field('description', 'Test')
      .field('category', 'house')
      .field('status', 'new')
      .field('location', 'test')
      .field('features', ['true', 'false', 'false', 'false', 'false'])
      .attach('file', '');
    res = await request(app.callback())
      .delete('/api/property/delete/3');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Something went wrong during owner verification!');
  });
});
