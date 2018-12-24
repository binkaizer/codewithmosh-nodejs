const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    res.render('index', {title: 'My Express App', message: 'Hello'});
});

router.get('/api/posts/:year/:month', (req, res) => {
    res.send(req.params);
})


module.exports = router;