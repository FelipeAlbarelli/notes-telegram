const express = require('express')
require('./db/mongoose') //connect to db
const app = express();
const port  = process.env.PORT || 3000;
const userRouter = require('./routers/users')
const botgram = require('botgram')
const User = require('./models/users')
const Notes = require('./models/notes')
const botKey = require('./keys');

const bot    = botgram(botKey)

bot.context({a : 1})

bot.command('start' , async (msg , reply , next) => {
    const {username , id : telegramId , name} = msg.from;
    const findUser = await User.find({telegramId});
    // console.log(findUser);
    if (findUser.length != 0){
        return reply.text(`bem vinda(o) de volta ${name}`)
    }
    try {
        console.log(msg.from)
        const user = new User({username, telegramId , name});
        await user.save();
        reply.text(`bem vinda(o) ${name}`)
    } catch (e) {
        reply.text('infelizmente houve um erro no cadastro inicial');
        reply.text(e.toString())
    }

})

bot.text( (msg , reply , next) =>{
    reply.text('oie')
})

bot.command('add' , async (msg , reply , next) => {
    const {content , tag} = Notes.getObjFromCommand(msg.args());
    try {
        const user = await User.findOne({telegramId : msg.from.id});
        const note = new Notes({content , tag , owner : user._id});
        await note.save()
    } catch (e) {
        const error = content ? 'erro desconhecido, por favor contate o admin' : 'a anotação não pode ser vazia'
        reply.text(error)
    }
})

bot.command('list', async (msg, reply, next) => {
    const {tag} = Notes.getObjFromCommand(msg.args());
    try {
        const user =  await User.findOne({telegramId : msg.from.id});
        const _id  = user._id;
        const query = tag == '' ? {owner : _id} : {tag , owner : _id};
        const notes = await Notes.find(query);
        const result = notes.reduce( (acu , atual , i) => acu + '\n' + `${i}) ` + atual.content , '' );
        reply.text(result)
    } catch (e) {
        console.log(e)
        reply.text('algo errado ocorreu')
    }
})

bot.command('test' , (msg , reply , next) => {

})

app.use(express.json())
app.use(userRouter)

app.listen(port , () => {
    console.log('-----------------------------------')
    console.log('server is up on port' , port)
})

