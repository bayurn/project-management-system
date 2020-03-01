-- table user
CREATE TABLE users (
    userid      SERIAL      PRIMARY KEY,
    email       VARCHAR(50),
    password    VARCHAR(100),
    firstname   VARCHAR(20),
    lastname    VARCHAR(10)  
);

INSERT INTO users (email, password, firstname, lastname)
VALUES ('ayuna99@gmail.com', 'ayunarizky99', 'Ayuna', 'Rizky'),
('jxlol22@gmail.com', 'maling2ayam', 'Jason', 'Abrar'); 

-- tabel projects
CREATE TABLE projects (
    projectid   SERIAL      PRIMARY KEY,
    name        VARCHAR(50),
);

INSERT INTO projects (name)
VALUES ('Build a website'),
('Fix a bug')

-- tabel members
CREATE TABLE members (
    id          SERIAL  PRIMARY KEY,
    userid      INTEGER,
    role        VARCHAR(50),
    projectid   INT,
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (projectid) REFERENCES projects(projectid)
);

INSERT INTO members (userid, role, projectid)
VALUES (1, 'Manager', 1),
(2, 'Software Developer', 2);

-- tabel issues
CREATE TABLE issues (
    issuesid    SERIAL  PRIMARY KEY,
    projectid   INTEGER,
    tracker     VARCHAR(50),
    subject     VARCHAR(50),
    description TEXT,
    status      VARCHAR(50),
    prioty,      
    assignee,
    startdate,
    duedate,
    estimatedtime,
    done,
    files,
    spenttime,
    targetversion,
    author,
    createdate  TIMESTAMP,
    updatedate  TIMESTAMP,
    closeddate  TIMESTAMP,
    parenttask,
    FOREIGN KEY (projectid) REFERENCES projects(projectid),
    FOREIGN KEY (userid) REFERENCES members(userid) 
);

-- tabel activity
CREATE TABLE activity (
    activityid  SERIAL  PRIMARY KEY,
    time        TIMESTAMP,
    title       VARCHAR(10),
    description TEXT,
    author,
);

