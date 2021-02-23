const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const User = require('./models/UserSchema')

require('dotenv').config()

const app = express()
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'prince david'
}))
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())


app.set('view engine','ejs')

// database

mongoose.connect(process.env.DB_URL, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true})
.then((err, info) => {
console.log('db connected successfully')
})
.catch(err => console.log(err))


// render homepage
app.get('/', (req,res) => {
  res.render('index')
})

// render login form
app.get('/login', (req,res) => {
  res.render('login')
})


const redirectLogin = (req,res,next) => {

  if(!req.session.userId){
    res.redirect('/login')
  }else{
    next()
  }
}

// homepage

app.get('/dashboard', redirectLogin , (req, res) => {
  res.render('home');
})

/* auth routes begin */

// registering a user
app.post('/register', async (req,res) => {
var {name , email, password} = req.body

try {

const result = await User.findOne({email})

if(result){
res.send('email is already registered')
}else{


const hashedpass = await bcrypt.hash(password, 10)

const user = new User({name, email, password: hashedpass})
  
await user.save()
res.redirect('/login')

}
} catch (error) {
  console.log(error.message)
}
})


// login a user

app.post('/login', async (req,res) => {

try {

var {email, password} = req.body

const user = await User.findOne({email})

if(user){

if(await bcrypt.compare(password, user.password)){

req.session.userId = user
req.session.save()
res.redirect('/dashboard')

}else{

res.send('Email and password did not match')
}
}else{

res.send('email is not registered')
}  

} catch (error) {
console.log(error)
}

})

// logout

app.post('/logout', (req,res) => {
  req.session.destroy()
  res.redirect('/login')
})

/* auth routes end */

const PORT = process.env.PORT || 3000

app.listen(PORT, (e) => {

  if(e)
      console.log(err)
  else
      console.log(`listening on port ${PORT}`)
})