// template for shortUrls

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  originalUrl: String,
  shorterUrl: String
}, {timestamps: true});

const ModelClass = mongoose.model('shortURLs', urlSchema);

module.exports = ModelClass;
