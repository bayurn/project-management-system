const express = require('express');
const router = express.Router();

const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        res.redirect('/')
    }
}

module.exports = (pool) => {
    router.get('/', isLoggedIn, function (req, res, next) {
        let user = req.session.user;
        res.render('project/projects', {title: 'Judul', menu:'projects'})
    })
    return router
}