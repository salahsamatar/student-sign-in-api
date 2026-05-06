// api.js defines all the API routes (URL endpoints) for student data.
// An API route is a URL + HTTP method combination that the server
// responds to — like GET /api/students or POST /api/students.
const express = require('express')
const router = express.Router()

// Import the Student model so we can query the database
const { Student } = require('../models/index')

// ── GET /api/students ─────────────────────────────────────────────────────
// Returns all students from the database as a JSON array, sorted by name.
// GET is used for read-only requests that don't change any data.
router.get('/students', async (req, res, next) => {
  try {
    // Student.findAll() is a Sequelize method — it runs SELECT * FROM Students
    // The order option sorts alphabetically by name (ASC = ascending A→Z)
    const students = await Student.findAll({ order: [['name', 'ASC']] })

    // res.json() sends the data back as JSON and sets Content-Type: application/json
    res.json(students)
  } catch (err) {
    // Pass unexpected errors to Express's error handler in server.js
    next(err)
  }
})

// ── POST /api/students ────────────────────────────────────────────────────
// Creates a new student. The client sends { name, starID } in the request body.
// POST is used when creating a new resource.
router.post('/students', async (req, res, next) => {
  try {
    // req.body contains the JSON data sent by the client.
    // express.json() in server.js parses the raw JSON string into a JS object.
    const newStudent = await Student.create({
      name:    req.body.name,
      starID:  req.body.starID,
      present: false
    })

    // 201 = "Created" — more specific than 200 OK, signals a resource was made
    res.status(201).json(newStudent)

  } catch (err) {
    // Sequelize throws a ValidationError when our model rules are violated
    // (e.g., missing name, duplicate starID). Return 400 = "Bad Request".
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      // Map the array of error objects to just their messages for the response
      const messages = err.errors.map(e => e.message)
      return res.status(400).json({ errors: messages })
    }
    next(err)
  }
})

// ── PATCH /api/students/:id ───────────────────────────────────────────────
// Updates an existing student. :id is a URL parameter — Express puts its
// value in req.params.id. So a request to /api/students/3 means id = "3".
// PATCH is used for partial updates (changing some fields, not replacing everything).
router.patch('/students/:id', async (req, res, next) => {
  try {
    // Student.update() runs UPDATE ... WHERE id = req.params.id
    // It returns [numberOfRowsChanged], so we destructure to get that number.
    const [rowsUpdated] = await Student.update(
      {
        name:    req.body.name,
        starID:  req.body.starID,
        present: req.body.present
      },
      { where: { id: req.params.id } }
    )

    // If 0 rows were updated, no student with that id exists → send 404 Not Found
    if (rowsUpdated === 0) {
      return res.status(404).json({ error: 'Student not found' })
    }

    // Fetch the updated student from the DB to return the latest data
    const updatedStudent = await Student.findByPk(req.params.id)
    res.json(updatedStudent)

  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      const messages = err.errors.map(e => e.message)
      return res.status(400).json({ errors: messages })
    }
    next(err)
  }
})

// ── DELETE /api/students/:id ──────────────────────────────────────────────
// Deletes the student with the given id from the database.
// DELETE is used to remove a resource permanently.
router.delete('/students/:id', async (req, res, next) => {
  try {
    // Student.destroy() runs DELETE FROM Students WHERE id = ?
    // Returns the number of rows deleted.
    const rowsDeleted = await Student.destroy({
      where: { id: req.params.id }
    })

    // If nothing was deleted, the student doesn't exist → 404
    if (rowsDeleted === 0) {
      return res.status(404).json({ error: 'Student not found' })
    }

    // 200 with a message confirms the deletion succeeded
    res.json({ message: 'Student deleted successfully' })

  } catch (err) {
    next(err)
  }
})

// Export the router so server.js can mount it
module.exports = router