const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload the quiz with id equals to :quizId
exports.load = (req, res, next, quizId) => {

    models.quiz.findById(quizId)
    .then(quiz => {
        if (quiz) {
            req.quiz = quiz;
            next();
        } else {
            throw new Error('There is no quiz with id=' + quizId);
        }
    })
    .catch(error => next(error));
};


// GET /quizzes
exports.index = (req, res, next) => {

    models.quiz.findAll()
    .then(quizzes => {
        res.render('quizzes/index.ejs', {quizzes});
    })
    .catch(error => next(error));
};


// GET /quizzes/:quizId
exports.show = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/show', {quiz});
};


// GET /quizzes/new
exports.new = (req, res, next) => {

    const quiz = {
        question: "", 
        answer: ""
    };

    res.render('quizzes/new', {quiz});
};

// POST /quizzes/create
exports.create = (req, res, next) => {

    const {question, answer} = req.body;

    const quiz = models.quiz.build({
        question,
        answer
    });

    // Saves only the fields question and answer into the DDBB
    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz created successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/new', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error creating a new Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/edit
exports.edit = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/edit', {quiz});
};


// PUT /quizzes/:quizId
exports.update = (req, res, next) => {

    const {quiz, body} = req;

    quiz.question = body.question;
    quiz.answer = body.answer;

    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz edited successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/edit', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error editing the Quiz: ' + error.message);
        next(error);
    });
};


// DELETE /quizzes/:quizId
exports.destroy = (req, res, next) => {

    req.quiz.destroy()
    .then(() => {
        req.flash('success', 'Quiz deleted successfully.');
        res.redirect('/quizzes');
    })
    .catch(error => {
        req.flash('error', 'Error deleting the Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/play
exports.play = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || '';

    res.render('quizzes/play', {
        quiz,
        answer
    });
};


// GET /quizzes/:quizId/check
exports.check = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

    res.render('quizzes/result', {
        quiz,
        result,
        answer
    });
};

// GET/quizzes/randomplay

exports.playrandom = (req, res, next) => {

    let getRandomId = () =>{
        let id = req.session.randomplay[Math.floor((Math.random() * req.session.randomplay.length))];
        req.session.randomplay.splice(req.session.randomplay.indexOf(id), 1);
        console.log("El id es: "+id);
        return id;
    }
    let gameStarted = () =>{
        if(req.session.started === undefined){
            console.log("SE INICIA DE NUEVO");
            req.session.randomplay = [];
            req.session.score = 0;
            req.session.started = true;
            return models.quiz.count().then(numOfQuizzes =>{
                for(let i = 0; i < numOfQuizzes; i++){
                    req.session.randomplay[i] = i+1;
                }
            });
        }
        console.log("started "+req.session.started);
        return Promise.resolve();
    } 

    gameStarted().then(() => {
        if(req.session.started && req.session.randomplay.length === 0){
            return new Promise(resolve =>{
                let score = req.session.score;
                delete req.session.started;
                res.render('quizzes/random_nomore',{
                    score
                });
            })
        }
        return models.quiz.findById(getRandomId()).then(quiz => {
            let score = req.session.score;
            console.log("Responde pregunta----->>>>>>");
            console.log(req.session.started);
            console.log(req.session.randomplay)
            res.render('quizzes/random_play',{
                score,
                quiz
            });
        })
    }).catch(e =>{
        res.render('error',e);
    })
};

//GET /quizzes/randomcheck/:quizId?answer=respuesta
exports.playresult = (req, res, next) => {
    let answer = req.query.answer;
    let quizId = req.params.quizId;
    console.log("Comprobacion");
    console.log(quizId);
    models.quiz.findById(quizId).then(quiz =>{
        let score = 0;
        if(quiz.answer === answer){
            result = 1;
            req.session.score++;
        }else{
            result = 0;
            delete req.session.started;
        }
        score = req.session.score;
        res.render('quizzes/random_result',{
            score,
            answer,
            result
        })  
    });

};

exports.playnomore = (req, res, next) => {
    let score = 0;
    res.render('quizzes/random_nomore',{
        score
    })  
};
