import slugify from 'slugify';
import Keyword from '../models/keywordModel.js';

const generateKeyword = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: "Name and description are required" });
    }

    const slug = slugify(name, { lower: true, strict: true });
    const keywordText = `${name} - Buy Now at Best Price | Epic Moments`;
    const content = `<h2>${name}</h2><p>${description}</p>`;

    const keyword = await Keyword.findOneAndUpdate(
      { slug },
      { slug, keyword: keywordText, description, content },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Keyword generated", keyword });
  } catch (error) {
    console.error("Keyword generation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllKeywords = async (req, res) => {
  try {
    const keywords = await Keyword.find().sort({ createdAt: -1 });
    res.json({ success: true, keywords });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch keywords" });
  }
};

const getKeywordBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const keyword = await Keyword.findOne({ slug });

    if (!keyword) {
      return res.status(404).json({ success: false, message: 'Keyword not found' });
    }

    res.json({ success: true, keyword });
  } catch (error) {
    console.error("Slug fetch error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteKeyword = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Keyword.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Keyword not found' });
    }

    res.json({ success: true, message: 'Keyword deleted successfully' });
  } catch (error) {
    console.error('Keyword delete error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting keyword' });
  }
};

export {
  generateKeyword,
  getAllKeywords,
  getKeywordBySlug,
  deleteKeyword
};
