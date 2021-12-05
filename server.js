const express = require('express')
const app = express()
app.use(express.json()) // иначе выдаст ошибку и не сверит введеную в postman информацию с database
//bcrypt give a way to hash a password and a way to compare passwords
const bcrypt = require('bcrypt-nodejs') // отсюда (функции тоже, с вкладки asynchronous): https://www.npmjs.com/package/bcrypt-nodejs
const cors = require('cors') // иначе хром не разрешит сделать fetch с этим сервером (связь с какой-то левой базой)
// npm install cors

const register = require('./controllers/register') // подключаем register.js
const signin = require('./controllers/signin')
const profile = require('./controllers/profile')
const image = require('./controllers/image')

// после npm install knex + npm install pg; код шаблона с сайта knex, потом его адаптировали
const knex = require('knex')

const db = knex({
    client: 'pg', 
    connection: {
      host : '127.0.0.1', // это то же самое, что localhost
      port : 5432,
      user : 'postgres', // у Андрея была его фамилия, но я поставил postgres как owner
      password : 'VeritAs',
      database : 'smart-brain'
    }
  });

// console.log(postgres.select('*').from('users')) - выдаст Builder object
db.select('*').from('users').then(data => {
    console.log(data); // консольложит объект юзеров (без json)
});

app.use(cors()) // middlare, без которого не будет связи у приложения с этим сервером

// ROOT
app.get('/', (req, res) => {res.send('success!!!')})
// // передадим все туда, чтобы в register.js не надо было импортировать knex и bcrypt. Это называется Dependency Injectino
app.post('/signin', signin.handleSignin(db, bcrypt)) // раньше было: app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) } ). Now instead of declaring the function we first running the first function which receives db y bcrypt and then it automatically receives req and res (см. signin.js). Получается каррирование
// остальные эндпойнты обычным кодом
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) } ) 
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db) }) 
app.put('/image', (req, res) => { image.handleImage(req, res, db) }) 
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) }) 


app.listen(process.env.PORT || 3000, () => { // либо порт из среды, либо порт 3000
    console.log(`app is running on port ${process.env.PORT}`)
})

