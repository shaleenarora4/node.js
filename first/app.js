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
const jwtExpirySeconds = 10000;

app.get("/welcome", function (req, res) {
    User.find({}).then(function (data) {
        console.log('------in welcome--------')
        console.log(data);
        res.json(data);
    }).catch(function (error) {
        res.status(400).send(error);
    })
});

app.post("/signup/users", function (req, res) {
    console.log('------in signup--------');
    console.log(req.body);
    User.create(req.body).then(function (data) {
        res.json(data);
    }).catch(error => {
       console.log('mobile.no already exists');
    });
});

app.post("/login/users", function (req, res) {
    const { mobile, pass } = req.body;
    User.count({mobile:mobile,pass:pass}, function (err, count){ 
        if(count==1){
            console.log('------in login--------');
            const token = jwt.sign({ mobile }, jwtKey, {
                                algorithm: "HS256",
                                expiresIn: jwtExpirySeconds,
                            })
            console.log('------token-----------');
            console.log(token); 
            return res.json({token:token});               
        }
        else{
            console.log(`mobile_no and password doesn't match`);
        }
    })
    
})

//gives userinfo with token 
app.post("/user_info/user", function (req, res) {
    try{
    const {token} = req.body;
    if (!token) {
		return res.status(401).end()
    }	
    const payload = jwt.verify(token, jwtKey);
    console.log('------------payload----------------');
    console.log(payload);
    res.send(`Welcome ${payload.mobile}!`);   
    console.log("--------updating record------------");
    console.log(payload.mobile,req.body.name,req.body.city);
    User.findOneAndUpdate( { "mobile": payload.mobile }, { "name" : req.body.name}).then(function (data) {
        console.log('------in welcome--------')
        console.log(data);
        res.json(data);
    }).catch(function (error) {
        res.status(400).send(error);
    })
    }
    catch(e){
        res.json(e);
    }
});

var server = app.listen(4000, function () {
    console.log("app running on port.", server.address().port);
});
