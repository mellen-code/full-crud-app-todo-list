// Declare variables
const express = require('express')
const app = express()
const PORT = 8000
// Mongoose instead of MongoClient
const mongoose = require('mongoose')
require('dotenv').config()
const TodoTask = require('./models/todotask')


// Set middleware
app.set('view engine', 'ejs')
// Tells Express to go to public folder for user-facing content
app.use(express.static('public'))
// Validates data being passed back and forth
app.use(express.urlencoded({extended: true}))

mongoose.set('strictQuery', true);

mongoose.connect(process.env.DB_CONNECTION, 
    {useNewUrlParser: true},
    () => {console.log('Connected to db!')}
)


// REFACTOR WITH AWAIT
app.get('/', async (req, res) => {
    try {
        TodoTask.find({}, (err, tasks) => {
            res.render('index.ejs', {
                todoTasks: tasks
            })
        })
    } catch (error) {
        res.status(500).send({message: error.message})
    }
});

// Takes input, puts into Mongodb, and returns updated DOM. Try destructuring todoTask
app.post('/', async (req, res) => {
    const todoTask = new TodoTask(
        {
            title: req.body.title,
            content: req.body.content
        }
    );
    try {
        await todoTask.save();
        console.log(todoTask)
        res.redirect('/');
    } catch(err) {
        if (err) return res.status(500).send(err)
        res.redirect('/');
    }
});

// EDIT task (when edit button is clicked). 
// Using POST because forms do not support PUT requests, and so don't have to have any client-side JS.
app
    .route('/edit/:id')
    .get((req, res) => {
        const id = req.params.id
        TodoTask.find({}, (err, tasks) => {
            res.render('edit.ejs', {
                todoTasks:tasks, idTask: id})
        })
    })
    .post((req, res) => {
        const id = req.params.id
        TodoTask.findByIdAndUpdate(
            id,
            {
                title: req.body.title,
                content: req.body.content
            },
            err => {
                if (err) return res.status(500).send(err)
                res.redirect('/')
            }
        )   
    })

// DELETE. No app.delete because not doing any client-side JS (e.g. fetchs)
app
    .route('/remove/:id')
    .get((req, res) => {
        const id = req.params.id
        TodoTask.findByIdAndRemove(id, err => {
            if (err) return res.status(500).send(err)
            res.redirect('/')
        })
    })


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})