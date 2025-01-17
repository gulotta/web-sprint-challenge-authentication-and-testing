const router = require('express').Router();
const User = require('../users/users-model')
const bcrypt = require('bcryptjs')
const { checkBody, userNameFree, userNameExists} = require('./auth-middleware')
const {BCRYPT_ROUNDS} = require('../../config/index')
const {tokenBuilder} = require('./auth-helper')

/*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */

router.post('/register', checkBody, userNameFree, (req, res) => {
  const {username, password} = req.body

  const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS)

  const newUser = {
    username: username,
    password: hash,
    id: req.params.id
  }

  console.log(newUser)

  User.add(newUser)
  .then(user => {
    res.status(201).json(user)
  })
  .catch(err => {
    res.status(500).json(err.message)
  })
})

/*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */


router.post('/login', checkBody, userNameExists, (req, res) => {
  let {username, password} = req.body
  User.findBy({username})
  .then(user => {
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = tokenBuilder(user)
     return res.status(200).json({
        message: `Welcome, ${user.username}`, 
        token: token
    })
  } else {
     return res.status(401).json({message: "invalid credentials"})
  } 
})
 
})


module.exports = router;
