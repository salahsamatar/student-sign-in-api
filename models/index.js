// index.js connects to the database and loads all models.
// Any file that needs DB access imports from here, not from individual model files.
const { Sequelize } = require('sequelize')
const config = require('../config.json')

// Determine if we're running locally (development) or deployed (production).
// process.env.NODE_ENV is an environment variable — Azure sets it to 'production',
// your local machine leaves it undefined (so we default to 'development').
const env = process.env.NODE_ENV || 'development'
const dbConfig = config[env]

// Create the Sequelize connection using the config settings for our environment.
// In development this opens (or creates) students.sqlite as a local file.
const sequelize = new Sequelize(dbConfig)

// Load the Student model and pass the sequelize connection into it.
const Student = require('./student')(sequelize)

// sync() compares the model definition to the actual DB table.
// { force: false } means: create the table if it doesn't exist,
// but DON'T delete and re-create it if it already exists —
// that would erase all your data every server restart!
Student.sync({ force: false })

module.exports = { Student }