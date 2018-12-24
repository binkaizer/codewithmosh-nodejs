const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');
const config = require('config');
const morgan = require('morgan');
const helmet = require('helmet');
const Joi = require('joi');
const logger = require('./logger')
const express = require('express');
const app = express();

console.log(`NODE_ENV: ${process.env.NODE_ENV}`); //undefined
console.log(`app: ${app.get('env')}`);

app.use(express.json());
app.use(express.urlencoded({extended: true})); //key=value&key=value
app.use(express.static('public'));
app.use(helmet());

//Configuration
console.log('Application Name: ' + config.get('name'));
console.log('Mail Server: ' + config.get('mail.host'));
console.log('Mail Password: ' + config.get('mail.password'));

if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    // console.log('Morgan enable...');
    startupDebugger('Morgan enabled...');
}

//Db work...
dbDebugger('Connected to the database...');


app.use(logger);

app.use(function(req, res, next){
    console.log('Authentication...');
    next();
})

const courses = [
    { id: 1, name: 'course1'},
    { id: 2, name: 'course2'},
    { id: 3, name: 'course3'}
];

app.get('/', (req, res) => {
    res.send('Hello World!!!');
});

app.get('/api/courses', (req, res) => {
    res.send(courses)
})

app.get('/api/posts/:year/:month', (req, res) => {
    res.send(req.params);
})

app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status(404).send('The course with the given ID was not found');
    res.send(course);
})

app.post('/api/courses', (req, res) =>{
    // console.log(result);
    

    // if(!req.body.name || req.body.name.length < 3){
    //     //400 Bad Request
    //     res.status(400).send('Name is required and should be minimum 3 characters');
    //     return;
    // }

    const result = validateCourse(req.body);
    const {error} = validateCourse(req.body); // result.error
    if(error) return res.status(400).send(error.details[0].message);

    const course = {
        id: courses.length + 1, 
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
})

app.put('/api/courses/:id', (req, res) =>{
    //Look up the course
    //If not existing, return 404
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status(404).send('The course with the given ID was not found');

    //Validate
    //If invalid, return 400 - Bad Request
    const result = validateCourse(req.body);
    const {error} = validateCourse(req.body); // result.error
    if(error) return res.status(400).send(error.details[0].message);

    //Update course
    //Return the updated course
    course.name = req.body.name;
    res.send(course);
})

app.delete('/api/courses/:id', (req, res) => {
    //Look up the course
    //Not existing , return 404
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status(404).send('The course with the given ID was not found');

    //Delete
    const index = courses.indexOf(course);
    courses.splice(index, 1);

    //Return the same course
    res.send(course);

});

//PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}...`));


function validateCourse(course){
    const schema = {
        name: Joi.string().min(3).required()
    };
    return Joi.validate(course, schema);
}