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
        const { checkID, checkName, checkMember, inputID, inputName, inputMember } = req.query;

        const link = (req.url == '/') ? '/?page=1' : req.url;
        const page = req.query.page || 1;
        const limit = 3;
        const offset = (page - 1) * limit;
        let params = [];

        if (checkID && inputID) {
            params.push(`projects.projectid='${inputID}'`)
        }

        if (checkName && inputName) {
            params.push(`projects.name LIKE '%${inputName}%'`)
        }

        if (checkMember && inputMember) {
            params.push(`members.userid='${inputMember}'`)
        }

        let sql = `SELECT COUNT(id) as total FROM (SELECT DISTINCT projects.projectid AS id FROM projects LEFT JOIN members ON projects.projectid = members.projectid`;

        if (params.length > 0) {
            sql += ` WHERE ${params.join(" AND ")}`;
        }
        sql += `) AS projectmember`;

        pool.query(sql, (err, count) => {
            if (err) res.status(500).json(err);

            const total = count.hasOwnProperty('rows') ? count.rows[0].total : 0;
            const pages = Math.ceil(total / limit);

            sql = `SELECT DISTINCT projects.projectid, projects.name FROM projects LEFT JOIN members ON projects.projectid = members.projectid`

            if (params.length > 0) {
                sql += ` WHERE ${params.join(" AND ")}`;
            }
            sql += ` ORDER BY projects.projectid DESC LIMIT ${limit} OFFSET ${offset}`;

            let subquery = `SELECT DISTINCT projects.projectid FROM projects LEFT JOIN members ON projects.projectid = members.projectid`;

            if (params.length > 0) {
                subquery += ` WHERE ${params.join(" AND ")}`
            }
            subquery += ` ORDER BY projects.projectid DESC LIMIT ${limit} OFFSET ${offset}`;

            let sqlMember = `SELECT projects.projectid, users.userid, CONCAT (users.firstname,' ',users.lastname) AS fullname FROM projects LEFT JOIN members ON projects.projectid = members.projectid LEFT JOIN users ON users.userid = members.userid WHERE projects.projectid IN (${subquery})`;

            pool.query(sql, (err, projectData) => {
                if (err) res.status(500).json(err);

                pool.query(sqlMember, (err, memberData) => {
                    if (err) res.status(500).json(err);

                    projectData.rows.map(project => {
                        project.member = memberData.rows.filter(member => member.projectid == project.projectid).map(data => data.fullname).sort().join(', ').trim()
                    })

                    let sqlUser = `SELECT * FROM users`;
                    pool.query(sqlUser, (err, data) => {
                        if (err) res.status(500).json(err)

                        let sqlGetOption = `SELECT optionproject FROM users WHERE userid=${req.session.user.userid}`;
                        pool.query(sqlGetOption, (err, dataOption) => {
                            if (err) res.status(500).json(err);
                            res.render('project/projects', {
                                title: 'PMS Dashboard',
                                menu: 'projects',
                                user: req.session.user,
                                query: req.query,
                                page,
                                pages,
                                link,
                                dataUser: data.rows.map(item => item),
                                dataProject: projectData.rows.map(item => item),
                                projectMessage: req.flash('projectMessage'),
                                option: dataOption.rows[0].optionproject
                            })
                        })
                    })
                })
            })
        })
    });
    // res.render('project/projects', {title: 'Judul', menu:'projects'})
    return router
}