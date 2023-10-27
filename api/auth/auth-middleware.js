const User = require("../users/users-model")

function checkBody(req, res, next){
    if (
        !req.body.username ||
        !req.body.password
    ) {
        return next({status: 401, message: "username and password required"})
    }
    next()
}

async function userNameFree(req, res, next) {
    try {
        const user = await User.findBy({ username: req.body.username})
        !user ? next() : res.status(400).json({message: "username taken"})
    } catch(err) {
        next(err)
    }
}

async function userNameExists(req, res, next) {
    try {
        const user = await User.findBy({username: req.body.username})
        !user ? res.status(401).json({message: "invalid credentials"})
        : (req.userFromDb = user)
        next()
    } catch(err) {
        next(err)
    }
}



module.exports = {
        checkBody,
        userNameFree,
        userNameExists
}