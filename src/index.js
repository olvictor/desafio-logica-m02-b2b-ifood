const express = require('express');
const app = express();
const rotas = require('./router');


app.use(express.json());
app.use(rotas)

app.listen(8000,()=>{
    console.log('Servidor aberto na porta 8000')
});