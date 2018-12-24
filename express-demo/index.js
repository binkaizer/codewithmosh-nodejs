const Joi = require('joi');
const express = require('express');
const app = express();

app.use(express.json());

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