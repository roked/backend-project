/**
 * @module models/messages
 * @description The message model - contains the History schema
 * @author Mitko Donchev
 */
import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    required: true,
  },
  msgs: [],
});

// Export the house model
export default mongoose.model('History', HistorySchema);
