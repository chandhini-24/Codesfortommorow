const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();

const port = 5000;
const secretkey = 'secretkey#123';

const mongoURI = 'mongodb+srv://chandhini:chandhini@cluster1.kiwms7e.mongodb.net/?retryWrites=true&w=majority'

const userSchema = new mongoose.Schema({
    Email: String,
    Password: String,
});
const user = mongoose.model('user', userSchema);


const signupSchema = new mongoose.Schema({
    First_Name: String,
    Last_Name: String,
    Email: String,
    Password: String,
});
const signup = mongoose.model('signup', signupSchema);

app.use(bodyparser.json());

app.post('/signup', async(req, res) =>{
    const {First_Name, Last_Name, Email, Password} = req.body;
    try{
        const user = await user.create({First_Name, Last_Name, Email, Password});
        if(user){
            const token = jwt.sign({First_Name:First_Name, Last_Name:Last_Name, Email:Email, Password:Password}, secretkey, {expiresIn: '1h'});
        }
    } catch(error){
        res.json({message: 'signup failed'});
    }

    res.json({message: 'signup successfull'});

});

app.post('/login', async(req, res) =>{
    const {Email, Password} = req.body;
    try{
        const login = await user.findOne({Email,Password});
        if(login){
            const token = jwt.sign({Email:Email,Password:Password}, secretkey, {expiresIn: '1h'});
            res.json({token});
        }else {
            res.status(400).json({messsage: "invalid creds"});

        }
    }catch{
        console.error(error);
        res.status(500).json({message: 'server error'});
    }
    res.json({message: 'login successfull'});
});

app.get('/users', async(req, res) =>{
    try{
    const allusers = await signup.find();
    res.json(allusers);
    }catch(error){
        console.error(error);
        res.status(500).json({message: 'server error'});
    }
});
app.get('/protected', authenticateToken,(req,res) =>{
    res.json({message: 'protected data'});
});
function authenticateToken(req, res, next){
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if(!token){
        return res.status(401).json({message: 'unauthorized'});
    }
    jwt.verify(token, secretkey, (error, user) =>{
        if(error){
            return res.status(403).json({message: 'forbidden'});
        }
        req.user = user;
        next();
    });
}
mongoose.connect(mongoURI).then(() => {
    console.log('connected to mongodb');
    app.listen(port,() =>{
        console.log(`server is running on port ${port}`);
    });
    
}).catch((error) =>{
    console.error(error);
});
