import mongoose from 'mongoose';
import app from './app.js';

const port = process.env.PORT || 3000;
// dbname as environment variables
const connectUri = process.env.URL || 'mongodb://localhost:27017/back_end';

/**
 * Connect to Mongoose
 *
 * @param {String} URI
 */
mongoose.connect(connectUri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => {
  console.log('Connected to DB!');
}).catch((err) => {
  console.log('Error: ', err.message);
});

// Start server on port 3000
app.listen(port, () => console.log('Web Server UP!'));
