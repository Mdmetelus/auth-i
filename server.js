const express = require('express');
const helmet = require('helmet');
const morganLogger = require('morgan');
const cors = require('cors');



const db = require('./database/dbConfig.js');
const server = express();




server.use(express.json());
server.use(helmet());
server.use(cors());
server.use(morganLogger());




//routes
server.get('/', (req, res) => {
    res.send(`API working.\n Sanity Check\n Test Route!`);
  });





module.exports = server;