const mongoose = require('mongoose');

// connect to server

mongoose.connect('mongodb://127.0.0.1:27017/noter-manager-api' , {
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology: true,
    useFindAndModify : false
})

