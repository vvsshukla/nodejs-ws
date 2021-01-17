const express = require('express');
const app = express();
const mysql = require('mysql');
const path = require('path');
const cookieParser = require('cookie-parser');
const myParser = require("body-parser");
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs-login'
});
db.connect((error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("Mysql Connected")
    }
})
const hbs = require('hbs');
hbs.registerHelper("equal", require("handlebars-helper-equal"));
app.set('view engine', 'hbs');

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
//Parse url encoded bodies like sent by html form
app.use(myParser.urlencoded({extended: false}));
// Cookie parser
app.use(cookieParser());
//Parse json bodies like sent by api request
app.use(myParser.json({extended: true}));

//Define routes
app.use('/', require('./routes/pages'))
app.use('/auth', require('./routes/auth'));


app.listen(5000);