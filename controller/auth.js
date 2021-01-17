const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {promisify} = require('util');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs-login'
});

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).render('login', {message: 'Please enter email and password.'});
        }
        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (!results || !await (bcrypt.compare(password, results[0].password))) {
                return res.status(401).render('login', {message: 'Incorrect email or password.'});
            } else {
                const id = results[0].id;
                const token = jwt.sign({id}, 'MySecretKey', {
                    expiresIn: '90d'
                });
                console.log("The token is " + token);
                const cookieOptions = {
                    expires: new Date(Date.now() + 90 * 24 * 60 * 60),
                    httpOnly: true
                }
                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect('/');
            }
        });
    } catch (error) {

    }
}

exports.register = (req, res) => {
    console.log(req.body);
    const {name, email, password, re_password} = req.body;
    db.query('SELECT email from users where email = ?', [email], (error, results) => {
        if (error) {
            console.log(error);
        }
        if (results.length > 0) {
            return res.render('register', {message: 'Email already exists.'});
        } else if (password !== re_password) {
            return res.render('register', {message: 'Password mismatch.'});
        }
        const hashedPassword = bcrypt.hashSync(password, 8);
        console.log(hashedPassword);
        db.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword}, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                return res.render('register', {message: 'User registered.'});
            }
        });
    });
}

exports.isLoggedIn = async (req, res, next) => {
    console.log(req.cookies);
    if (req.cookies.jwt) {
        try {
            //Verify the token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, 'MySecretKey');
            console.log(decoded);
            //Check if the user still exists
            db.query("SELECT * FROM users where id = ?", [decoded.id], (error, result) => {
                console.log(result);
                if (!result) {
                    return next();
                }
                req.user = result[0];
                return next();
            });
        } catch (error) {
            console.log(error);
        }
    } else {
        next();
    }
}

exports.logout = async (req, res) => {
    // res.cookie('jwt', req.cookies.jwt, {
    //     expires: new Date(Date.now() + 2 * 1000),
    //     httpOnly: true
    // });
    res.clearCookie('jwt');
    res.status(200).redirect('/');
}