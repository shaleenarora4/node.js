var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mongoose = require("mongoose");
var jwt = require('jsonwebtoken');
mongoose.connect("mongodb://localhost:27017/test", { useUnifiedTopology: true, useNewUrlParser: true });
const User = require("./userSchema");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const jwtKey = "my_secret_key";
const jwtExpirySeconds = 9000;


app.get('/', function (req, res) {
    try {
        res.status(200).send('Welcome to FIRST NODE ATTEMPT');
    } catch (e) {
        res.status(500).json(e);
    }
})

app.post('/signup', function (req, res) {
    try {
        const { mobile, pass } = req.body;
        User.count({ mobile: mobile, pass: pass }, function (e, result) {
            if (e) {
                res.status(500).send(e);
            }
            else {
                if (result === 0) {
                    User.create(req.body).then(() => {
                        res.status(200).send('Signup Successfull');
                    }).catch((e) => {
                        res.status(400).send('Enter complete details');
                    })
                }
                else {
                    res.status(200).send('Mobile number already exists');
                }
            }
        });
    }
    catch (e) {
        res.status(500).json(e);
    }
})

app.post('/login', function (req, res) {
    try {
        const { mobile, pass } = req.body;
        User.count({ mobile: mobile, pass: pass }, function (e, result) {
            if (e) {
                res.status(500).json(e)
            }
            else {
                if (result !== 1) {
                    res.status(200).send('Either mobile number or password is missing/incorrect')
                }
                if (result === 1) {
                    const token = jwt.sign({ mobile }, jwtKey, {
                        algorithm: "HS256",
                        expiresIn: jwtExpirySeconds,
                    })
                    return res.status(200).json({ token: token, msg: `Welcome ${mobile}!` });
                }
            }
        })
    } catch (e) {
        res.status(500).json(e);
    }
})

app.post('/user_info', function (req, res) {
    try {
        const token = req.body.token;
        if (!token) {
            res.status(400).send("no token entered");
        }
        else {
            const payload = jwt.verify(token, jwtKey);
            User.findOneAndUpdate({ "mobile": payload.mobile },
                { "name": req.body.name, "city": req.body.city, "age": req.body.age }).then(
                    res.status(200).send(`Welcome ${req.body.name}`)
                ).catch((e) => res.status(500).send(e))
        }
    }
    catch (e) {
        res.status(500).json(e);
    }
})

var server = app.listen(4000, function () {
    console.log("app running on port.", server.address().port);
});
