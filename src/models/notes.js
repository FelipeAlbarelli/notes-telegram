const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
    content : {
        type : String
        // required : true,
    },
    tag : {
        type : String
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId
    }
});

notesSchema.statics.getObjFromCommand = (command) => {
    const reg = /^#\w*#/;
    let parsedCommand = command.replace('/add' , '').trim();

    let tag = '';
    let content = ''
    let isTag = false

    if (! reg.test(parsedCommand) ){
        return {tag , content : parsedCommand}
    }

    for (let i = 0; i < parsedCommand.length ; i++){
        if (parsedCommand[i] == '#'){
            isTag = !isTag
        } else if (isTag){
            tag += parsedCommand[i]
        } else {
            content += parsedCommand[i]
        }
    }
    return {tag , content : content.trim()}
}

const Notes = mongoose.model('Notes' , notesSchema);


module.exports = Notes