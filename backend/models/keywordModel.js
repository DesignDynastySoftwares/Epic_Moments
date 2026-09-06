import mongoose from 'mongoose';

const keywordSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  keyword: { type: String, required: true },
  description: { type: String },
  content: { type: String }
}, {
  timestamps: true
});

export default mongoose.model('Keyword', keywordSchema);
