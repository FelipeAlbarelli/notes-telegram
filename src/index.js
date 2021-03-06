// const express = require('express')
require('./db/mongoose') //connect to db
// const app = express();
// const port  = process.env.PORT || 3000;
// const userRouter = require('./routers/users')
const botgram = require('botgram')
const User = require('./models/users')
const Notes = require('./models/notes')
const botKey = require('./keys');

const bot    = botgram(botKey)

bot.context({
    cacheArray : [],
    confirmed : false,
    looksForHelp : false
});

// middleware for all commands, check if 'looksForHelp', if true, then shows info about command instead
bot.command( /\w*/ , (msg , reply , next) => {
    reply.keyboard(false)

    if (msg.context.looksForHelp){
        switch (msg.text){
            case ('/add') :
                reply.text('/add #tag# texto' 
                + '\n' 
                + 'Adiciona uma anotação com uma tag. A tag deve estar entre dois "#" e é opcional. Notas com tags podem ser mais facilmente acessadas pelo comando /list.')
                break
            case ('/list') :
                reply.text('/list #tag#' 
                + '\n' 
                + 'Lista todas as anotações com a tag. Se não for fornecida uma tag, todas as anotações são listadas.'
                + '\n'
                + 'O índice i dado a cada anotação pode ser usado para remove-las usando o comando "/remove i".')
                break
            case '/remove' :
                reply.text('/remove i'
                + '\n'
                + 'Remove a anotação de índice "i" da última listagem fornecida pelo comando "/list".')
                break 
            case '/removeAll' :
                reply.text('/removeAll #tag#'
                + '\n'
                + 'Remove todas as anotações com a tag fornecida. Caso não seja fornecida uma tag, TODAS as notas são apagadas.'
                + '\n'
                + 'Em qualquer um dos casos, é feito um pedido de confirmação.')
                break
            default:
                reply.text('commando desconhecido')
                break
        }
        msg.context.looksForHelp = false;
    } else {
        next()
    }
})

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
        msg.context.cacheArray = notes;
        reply.text(result)
    } catch (e) {
        console.log(e)
        reply.text('algo errado ocorreu')
    }
})

bot.command('remove' , async (msg , reply , next) => {
    const arg = parseInt(msg.args());
    if (isNaN(arg) || arg < 0 || arg > msg.context.cacheArray.length - 1 ){
        return reply.text('indice inválido, use /help para saber mais.')
    }
    const note = msg.context.cacheArray[arg]
    console.log(note)
    try {
        await Notes.findByIdAndDelete(note._id);
        reply.text(`anotação ${note.content} removida com sucesso`);
    } catch (e) {

    }
})

bot.command('help' , (msg , reply , next) => {

    msg.context.looksForHelp = true;

    const keys =  [
        [ '/add' , '/list'],
        ['/remove' , '/removeAll']
    ]
    reply.keyboard(keys).text("Clique em um comando para saber mais sobre este.")

})


// app.use(express.json())
// app.use(userRouter)

// app.listen(port , () => {
//     console.log('-----------------------------------')
//     console.log('server is up on port' , port)
// })

console.log('-'.repeat(20))