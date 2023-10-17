const fs = require('fs/promises')
const {format} = require('date-fns')


const readDB = async () =>{
    const database = (await fs.readFile('./src/bancodedados.json')).toString();
    const databaseJSON = JSON.parse(database)
    return databaseJSON;
}

const writeDB = async (db) =>{
    const dbStringFY = JSON.stringify(db)
    await fs.writeFile('./src/bancodedados.json', dbStringFY)
}

const data = format(new Date(),"YYY-MM-dd hh:mm:ss")


module.exports = {
    readDB,
    writeDB,
    data
}