const mongoose = require('mongoose')
const config = require('../config')

mongoose.connect(`${config.mongodb}/opendata`, { useNewUrlParser: true, useUnifiedTopology: true })

const DatasetSchema = new mongoose.Schema({
  id: String,
  mappingId: String,
}, { strict: false })

const Dataset = mongoose.model('dataset', DatasetSchema)
module.exports = Dataset