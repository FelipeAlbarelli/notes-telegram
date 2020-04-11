const express = require('express');
const User = require('../models/users')
const userRouter = express.Router();


userRouter.get('/users' , async (req, res) => {
    const users = await User.find({});
    res.send(users)
})

userRouter.post('/users' , async (req, res) => {
    const user = new User(req.body)
    await user.save()
    res.send(user)
});

module.exports = userRouter