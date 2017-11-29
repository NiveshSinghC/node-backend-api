const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/database');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const upload = require('express-fileupload');
const socket = require('socket.io');

// Connect To Database
mongoose.connect(config.database);
mongoose.Promise = Promise;

// On Connection
mongoose.connection.on('connected', () => {
    console.log('Connected to database ' + config.database);
});

// On Error
mongoose.connection.on('error', (err) => {
    console.log('Database error: ' + err);
});

const app = express();

const users = require('./routes');

app.use(cookieParser());

// Port Number
const port = 5002;

// CORS Middleware
app.use(cors());

// Express-fileupload middleware
app.use(upload());

//express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));

//express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join('D:/project/myapp/src/src/assets')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', users);

// Index Route
app.get('/', (req, res) => {
    res.send('invalid location');
});

// Start Server
const server = app.listen(port, () => {
    console.log('Server started on port ' + port);
});

// socket setup
var io = socket(server);

io.sockets.on('connection', (socket) => {
    console.log('made socket connection at ->');

    socket.on('order:combine', (data, callback) => {
        socket.broadcast.emit('combine:order', data);
        callback(true);
        // console.log(data);
    });

    socket.on('order:delivered', (data, callback) => {
        socket.broadcast.emit('delivered:order', data);
        callback(true);
    })
});


