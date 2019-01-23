const express = require('express');
const knex = require('knex');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');
const allRoutes = require("./allRoutes/restrictedRoutes");
const KnexSessionStore = require('connect-session-knex')(session);

const knexConfig = require('./knexfile');

const server = express();

const db = knex(knexConfig.development);

const sessionConfig = {
    name:'NewSession',/// default is sid
    secret: 'Weird Secret: ergedfghrghbnsftghklnrtqrkntqwtgfdibdrgrk4585985675308gfdhfgkl',
    cookie: {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        secure: false, // only send a cookie over https, should be true in production
    },
    httpOnly: true, // js cant touch this cookie.
    resave: false,
    saveUninitialized: false,
    store: new KnexSessionStore({ // creating a tavle in the data baase to store the session an
        tablename:'sessions',
        sidfieldname: 'sid',
        knex: db,
        createtable: true,
        clearInterval: 1000 * 60 * 60, // only one camel cased, rest is lower cased.
    }),
};




// const db = require('./database/dbConfig.js');



server.use(express.json());
server.use(helmet());
server.use(cors());
server.use(session(sessionConfig));
server.use(morgan());

server.use('/api/restricted', allRoutes);



// Test route :



server.get('/', (req, res) => {
    res.send(`API working.\n Sanity Check\n Test Route!`);
});



//All Routes

server.post('/api/register', (req, res)=>{
    const user = req.body;
    if(user.username && user.password){
        user.password = bcrypt.hashSync(user.password);
        db('users')
        .insert(user)
        .then(ids=>{
            res.status(201).json({id: ids[0]});
        })
        .catch(error=>{
            res.status(500).json({error: 'Failed to add user'});
        })
    }
    else{
        res.status(400).json({errorMessage: 'Please include a username and password'});
    }
})

server.post('/api/login', (req, res)=>{
    const user = req.body;
    if(user.username && user.password){
        db('users')
        .where('username', user.username)
        .then(users=>{
            if(users.length && bcrypt.compareSync(user.password, users[0].password)){
                req.session.userId = users[0].id;
                res.json({info: `Welcome ${user.username}`});
            }
            else{
                res.status(404).json({errorMessage: 'Invalid username or password'});
            }
        })
        .catch(error=>{
            res.status(500).json({error: 'Failed to find user'});
        })
    }
    else{
        res.status(400).json({errorMessage: 'Please include a username and password'});
    }
})

server.post('/api/logout', (req, res)=>{
    req.session.destroy(error=>{
        if(error){
            res.status(500).json({errorMessage: 'Logout Failed'});
        }
        else{
            res.json({info: 'Logged Out'});
        }
    })
})

server.get('/api/users', (req, res)=>{
    if(req.session && req.session.userId){
        db('users')
        .select('id', 'username')
        .then(users=>{
            res.json(users);
        })
        .catch(error=>{
            res.status(500).json({error: 'Failed to return users'})
        })
    }
    else{
        res.status(401).json({errorMessage: 'Access Denied'});
    }
})


module.exports = server;