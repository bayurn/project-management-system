const express = require('express');
const router = express.Router();

const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        res.redirect('/')
    }
}

// module.exports = (pool) => {
//     router.get('/', isLoggedIn, function (req, res, next) {
//         const user = req.session.user;
//         const sql = `SELECT * FROM users WHERE email = '${user.email}'`;

//         pool.query(sql, (err, data) => {
//             if (err) res.status(500).json(err);
//             let result = data.rows[0]
//             res.render('profile/profile', {
//                 menu: 'profile',
//                 data: data.rows[0],
//                 user,
//                 result
//             })
//         })
//     })

//     router.post('/', (req, res, next) => {
//         const { firstname, lastname, password, position, jobtype, email } = req.body;
//         const querySql = `UPDATE users SET firstname='${firstname}', lastname='${lastname}', password='${password}', position='${position}', jobtype='${jobtype}' WHERE email='${email}'`;
//         console.log(querySql);

//         pool.query(querySql, (err, data) => {
//             res.redirect('/projects', {menu: 'profile'});
//         })
//     })

//     return router
// };
module.exports = (pool) => {

    router.get('/', isLoggedIn, (req, res, next) => {
        let user = req.session.user;
        const querySql = `SELECT * FROM users WHERE email='${user.email}'`;
        pool.query(querySql, (err, data) => {
            if (err) res.status(500).json(err);
            let result = data.rows[0]

            res.render('profile/profile', {
                menu: 'profile',
                user,
                result
            })
        })
    });

    router.post('/', isLoggedIn, (req, res, next) => {
        const { email, password, lastname, firstname, position, jobtype } = req.body;
        let editSql = '';

        if (!password) {
            editSql = `UPDATE users SET firstname='${firstname}', lastname='${lastname}', position='${position}', isfulltime='${jobtype == 'Full Time' ? true : false}' WHERE email='${email}'`
        } else {
            editSql = `UPDATE users SET firstname='${firstname}', lastname='${lastname}', position='${position}', isfulltime='${jobtype == 'Full Time' ? true : false}', password='${password}' WHERE email='${email}'`
        }
        pool.query(editSql, (err, data) => {
            if (err) res.status(500).send(err);
            res.redirect('/projects')
        })
    })
    return router
}