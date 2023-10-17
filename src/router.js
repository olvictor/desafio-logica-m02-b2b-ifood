const express = require('express');
const rotas = express();
const { getAccounts, createAccount,editUser,deleteUser,userDeposit, userWithdraw, userTransfer, searchUserSaldo, userExtrato } = require('../controllers/bankcontrollers')

rotas.get('/contas', getAccounts)
rotas.get('/contas/saldo', searchUserSaldo)
rotas.get('/contas/extrato', userExtrato)

rotas.put('/contas/:numeroConta/usuario', editUser)

rotas.delete('/contas/:numeroConta', deleteUser)

rotas.post('/contas', createAccount)
rotas.post('/transacoes/depositar', userDeposit)
rotas.post('/transacoes/sacar', userWithdraw)
rotas.post('/transacoes/transferir', userTransfer)





module.exports = rotas