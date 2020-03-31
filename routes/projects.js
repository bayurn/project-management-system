const express = require('express');
const router = express.Router();
const path = require('path');

const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        res.redirect('/')
    }
}

module.exports = pool => {

    router.get('/', (req, res) => {
        // pool.query(sql, (err) => {
        //     if (err) {
        //         return res.send(err)
        //     };
        // });
        res.render('project/projects')
    });

    return router
}
