// This file defines the Student model — the structure of one row in our
// Students database table. Sequelize reads this definition and creates
// (or syncs) the actual SQL table automatically.
const { DataTypes } = require('sequelize')

// module.exports is how we expose this function to index.js.
// It receives the already-connected sequelize instance as a parameter.
module.exports = (sequelize) => {

  // sequelize.define() creates a Model class AND tells Sequelize
  // to map it to a table called "Students" in the database.
  const Student = sequelize.define('Student', {

    // Each property here becomes a column in the Students table.
    // DataTypes.STRING = VARCHAR, DataTypes.BOOLEAN = TINYINT/BOOLEAN

    name: {
      type: DataTypes.STRING,
      allowNull: false,       // validation: name cannot be empty/null
      validate: {
        notEmpty: true        // also rejects empty strings ""
      }
    },

    starID: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,           // no two students can have the same starID
      validate: {
        notEmpty: true
      }
    },

    present: {
      type: DataTypes.BOOLEAN,
      defaultValue: false     // new students start as not present
    }
  })

  return Student
}