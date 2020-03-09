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
    router.get('/', isLoggedIn, (req, res, next) => {
        const page = req.quert.page || 1;
        const limit = 3;
        const offset = (page - 1) * limit;
        let params = [];
        const url = req.url == '/' ? '?page=1' : req.url;
        const { checkprojectid, projectid, checkname, name, checkmember, member } = req.query;

        if (checkprojectid && projectid) {
            params.push(`projects.projectid=${projectid}`)
        }

        if (checkname && name) {
            params.push(`projects.name ILIKE '%${name.toLowerCase()}%'`)
        }

        if (checkmember && member) {
            params.push(`members.userid=${member}`)
        };

        let sql = `SELECT COUNT(id) AS total FROM (SELECT DISTINCT projects.projectid AS id FROM projects LEFT JOIN members ON projects.projectid = members.projectid`;
        if (params.length > 0) {
            sql += `WHERE ${params.join(' AND ')}`;
        }
        sql += `) AS projectmember`;

        pool.query(sql, (err, count) => {
            const total = count.rows[0].total;
            const page = Math.ceil(total / limit);

            sql = `SELECT DISTINCT projects.projectid, projects.name FROM projects LEFT JOIN members ON projects.projectid = members.projectid`;
            if (params.length > 0) {
                sql += ` WHERE ${params.join(' AND ')}`;
            }

            sql += ` ORDER BY projects.projectid LIMIT ${limit} OFFSET ${offset}`

            let subquery = `SELECT DISTINCT projects.projectid FROM projects LEFT JOIN members ON projects.projectid = members.projectid`
            if (params.length > 0) {
                subquery += ` ORDER BY projects.projectid LIMIT ${limit} OFFSET ${offset}`
            }

            subquery += ` ORDER BY projects.projectid LIMIT ${limit} OFFSET ${offset}`

            let sqlMembers = `SELECT projects.projectid, users.userid, CONCAT (users.firstname,' ',users.lastname) AS fullname FROM projects LEFT JOIN members ON projects.projectid = members.projectid LEFT JOIN users ON users.userid = members.userid WHERE projects.projectid In (${subquery})`

            pool.query(sql, (err, response) => {
                if (err) throw err;
                pool.query(sqlMembers, (err, result) => {
                    response.rows.map(project => {
                        project.members = result.rows.filter(member => { return member.projectid == project.projectid }).map(data => data.fullname)
                    });

                    let sqlUsers = `SELECT * FROM users`;
                    let sqlOption = `SELECT projectsoptions FROM users WHERE userid=${req.session.user.userid}`;

                    pool.query(sqlUsers, (err, data) => {
                        pool.query(sqlOption, (err, option) => {
                            if (err) {
                                return res.send(err)
                            }

                            let sqlAdmin = `SELECT isadmin FROM users WHERE userid=${req.session.user.userid}`;
                            pool.query(sqlAdmin, (err, admin) => {
                                admin = admin.rows;
                                let isadmin = admin[0].isadmin;
                                res.render('project/projects', {
                                    title: 'Projects',
                                    menu: 'projects',
                                    data: response.rows,
                                    isadmin,
                                    query: req.query,
                                    users: data.rows,
                                    pagination: { pages, page, url },
                                    user: req.session.user,
                                    option: JSON.parse(option.rows[0].projectsoptions)
                                })
                            })
                        })
                    })
                })
            })
        })
    })

    router.post('/', (req, res) => {
        let sql = `UPDATE users SET projectsoptions = '${JSON.stringify(req.body)}' WHERE userid = ${req.session.user.userid}`
        pool.query(sql, (err) => {
            if (err) {
                return res.send(err)
            };
            res.redirect('/projects')
        });
    });

    router.get('/add', isLoggedIn, (req, res, next) => {
        let sqlAdd = `SELECT userid, firstname || ' ' || lastname AS fullname FROM users`;
        pool.query(sqlAdd, (err, result) => {
            let sqladmin = `SELECT isadmin FROM users WHERE userid = ${req.session.user.userid}`;
            pool.query(sqladmin, (err, admin) => {
                admin = admin.rows;
                let isadmin = admin[0].isadmin;
                if (err) {
                    return res.send(err)
                };
                res.render('projects/add', {
                    title: 'Add Project',
                    path: 'projects',
                    isadmin,
                    users: result.rows,
                    user: req.session.user
                });
            });
        });
    });

    return router
}
