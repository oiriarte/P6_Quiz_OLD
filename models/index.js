const path = require('path');

// Load ORM
const Sequelize = require('sequelize');


// To use SQLite data base:
//    DATABASE_URL = sqlite:quiz.sqlite
// To use  Heroku Postgres data base:
//    DATABASE_URL = postgres://user:passwd@host:port/database

const url = process.env.DATABASE_URL || "sqlite:quiz.sqlite";

const sequelize = new Sequelize(url);

// Import the definition of the Quiz Table from quiz.js
sequelize.import(path.join(__dirname, 'quiz'));

// Session
sequelize.import(path.join(__dirname,'session'));

// Create tables
sequelize.sync()
.then(() => console.log('Data Bases created successfully'))
.then(() => sequelize.models.quiz.count())
.then(count => {
    if(!count){
		return sequelize.models.quiz.bulkCreate([
                   { question: "Capital de Holanda", answer: "Amsterdam"},
                   { question: "Capital de Noruega", answer: "Oslo"},
                   { question: "Capital de Cuba", answer: "La Habana"},
                   { question: "Capital de Corea del Norte", answer: "Pyongyang"}
]);
}
}).catch(error => {
    console.log("Error creating the data base tables:", error);
    process.exit(1);
});


module.exports = sequelize;
