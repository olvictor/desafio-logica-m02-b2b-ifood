const {readDB, writeDB, data } = require('../utils/readDB')


const getAccounts =  async (req,res) =>{

    const { senha_banco } = req.query
    
    if(!senha_banco){
      return  res.status(400).json({
            mensagem:'Digite a senha'
        })
    }
    if(senha_banco !== 'Cubos123Bank'){
       return res.status(403).json({
            mensagem:'A senha do banco informada é inválida!'
        })
    }
    try{
        const jsonDB = await readDB();
        const contas =  jsonDB.contas;
        
        return res.status(200).json(contas)

    }
    catch(e){
        return res.status(500).json(e) 
    }

}

const createAccount = async (req,res)=>{
    const {
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha
    } = req.body;
    const jsonDB =  await readDB()
    const contas =  jsonDB.contas
    const buscaEmailExistente = contas.filter((conta)=> conta.usuario.email === email)
    const buscaCpfExistente = contas.filter((conta)=> conta.usuario.cpf === cpf)
    const ultimoIdentificadorUnico = contas.length > 0 ? contas[contas.length-1].numero : 0;
   
    if(!nome){
       return res.status(400).json({
            mensagem:'É necessário enviar o nome'
        })
    }

    if(!cpf){
        return  res.status(400).json({
            mensagem:'É necessário enviar o cpf'
        })
    }
    if(!data_nascimento){
        return res.status(400).json({
            mensagem:'É necessário enviar a data_nascimento'
        })
    }
    if(!telefone){
        return res.status(400).json({
            mensagem:'É necessário enviar o telefone'
        })
    }
    if(!email){
        return res.status(400).json({
            mensagem:'É necessário enviar o email'
        })
    }
    if(!senha){
        return res.status(400).json({
            mensagem:'É necessário enviar a senha'
        })
    }
    if(buscaCpfExistente.length > 0 || buscaEmailExistente.length > 0 ){
        return res.status(400).json({
            mensagem: "Já existe uma conta com o cpf ou e-mail informado!"
        })
    }

    const user = {
        "numero": +ultimoIdentificadorUnico + 1,
        "saldo": 0,
        "usuario": {
            "nome": nome,
            "cpf": cpf,
            "data_nascimento": data_nascimento,
            "telefone": telefone,
            "email": email,
            "senha": senha
        }
    }
    try{
        jsonDB.contas.push(user)
        
        await writeDB(jsonDB)
            
    
        return res.status(203).json()
    }
    catch(e){
        return res.status(500).json(e) 

    }

}

const editUser = async (req,res) =>{
    const { numeroConta } = req.params
    const jsonDB =  await readDB()
    const contas =  jsonDB.contas;
    const contaEncontrada = contas.find((conta)=> +conta.numero === +numeroConta)
    const {
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha
    } = req.body;
    
    const buscaEmailExistente = contas.find((conta)=> conta.usuario.email === email)
    const buscaCpfExistente = contas.find((conta)=> conta.usuario.cpf === cpf)
  
    if(contaEncontrada === undefined){
        return res.status(400).json({
            mensagem:'Conta não encontrada'
        })
    }

    if(!nome){
        return res.status(400).json({
             mensagem:'É necessário enviar o nome'
         })
     }
 
     if(!cpf){
         return  res.status(400).json({
             mensagem:'É necessário enviar o cpf'
         })
     }
     if(!data_nascimento){
         return res.status(400).json({
             mensagem:'É necessário enviar a data_nascimento'
         })
     }
     if(!telefone){
         return res.status(400).json({
             mensagem:'É necessário enviar o telefone'
         })
     }
     if(!email){
         return res.status(400).json({
             mensagem:'É necessário enviar o email'
         })
     }
     if(!senha){
         return res.status(400).json({
             mensagem:'É necessário enviar a senha'
         })
     }
     if(buscaEmailExistente !== undefined){
        return res.status(400).json({
            mensagem:'O Email informado já existe cadastrado!'
        })
     }
     if(buscaCpfExistente !== undefined){
        return res.status(400).json({
            mensagem:'O CPF informado já existe cadastrado!'
        })
     }

     contaEncontrada.usuario.nome = nome;
     contaEncontrada.usuario.cpf = cpf;
     contaEncontrada.usuario.data_nascimento = data_nascimento;
     contaEncontrada.usuario.telefone = telefone;
     contaEncontrada.usuario.email = email;
     contaEncontrada.usuario.senha = senha;
     
     const indiceDaconta = jsonDB.contas.findIndex((conta) => +conta.numero === +numeroConta)
     jsonDB.contas.splice(indiceDaconta,1,contaEncontrada)
     try{
        await writeDB(jsonDB)
         
        return res.status(204).json()

     }catch(e){
        return res.status(500).json(e) 
     }
}

const deleteUser = async (req,res) =>{
    const {numeroConta} = req.params
    const jsonDB = await readDB()
    const contas = jsonDB.contas;
    const contaEncontrada = contas.find((conta)=> +conta.numero === +numeroConta);

    if(!contaEncontrada){
        return res.status(403).json({
            mensagem:'Conta não encontrada'
        });
    }
    if(contaEncontrada.saldo > 0){
        return res.status(403).json({
            mensagem:"A conta só pode ser removida se o saldo for zero!"
        });
    }

    jsonDB.contas = contas.filter((conta)=> +conta.numero !== +numeroConta);
    
    try{
        await writeDB(jsonDB)
    
        return res.status(204).json();
    }
    catch(e){
        return res.status(500).json(e) 
    }
   

}


const userDeposit = async (req,res) =>{
    const {numero_conta, valor} = req.body;
    const jsonDB = await readDB();
    const contas = jsonDB.contas;
    const contaEncontrada = contas.find((conta)=> +conta.numero === +numero_conta)
  
    if(contaEncontrada === undefined){
        return res.status(403).json({
            mensagem: "A conta não foi encontrada"
        });
    }
    if(!numero_conta || !valor){
        return res.status(403).json({
            mensagem: "O número da conta e o valor são obrigatórios!"
        });
    }

    if(valor <= 0){
        return res.status(403).json({
            mensagem: "O valor de depósito precisa ser maior que Zero"
        });
    }
    
        contaEncontrada.saldo += valor
        jsonDB.depositos.push({
            "data": data,
            "numero_conta": numero_conta,
            "valor": +valor
        })
        
       try{
         await writeDB(jsonDB)
         return res.status(201).json();
       }
       catch(e){
        return res.status(500).json(e) 
       }
    
}


const userWithdraw = async (req,res)=>{
    const {numero_conta, valor, senha} = req.body;
    const jsonDB = await readDB();
    const contas = jsonDB.contas;
    const contaEncontrada = contas.find((conta)=> +conta.numero === +numero_conta)

    if(!numero_conta || !valor || !senha){
        return res.status(403).json({
            mensagem: "O numero_conta o valor e a senha são obrigatórios!"
        });
    }
    if(contaEncontrada === undefined){
        return res.status(403).json({
            mensagem: "A conta não foi encontrada"
        });
    }
    if(senha !== contaEncontrada.usuario.senha){
        return res.status(403).json({
            mensagem: "Senha incorreta"
        });
    }
    if(valor < 0){
        return res.status(403).json({
            mensagem: "O valor não pode ser menor que zero!"
        });
    }

    if(valor > contaEncontrada.saldo){
        return res.status(403).json({
            mensagem: "Saldo insuficiente para saque !"
        });
    }

    contaEncontrada.saldo -= valor
    jsonDB.saques.push({
        "data": data,
        "numero_conta": numero_conta,
        "valor": +valor
    })
    try{
        await writeDB(jsonDB)
        
        return res.status(201).json();
    }
    catch(e){
        console.log(e)
    }
}

const userTransfer = async(req,res) =>{
 const { 
     numero_conta_origem ,
     numero_conta_destino, 
     valor, 
     senha
    } = req.body
    
    const jsonDB = await readDB();
    const contaOrigem = jsonDB.contas.find((conta)=> +conta.numero === +numero_conta_origem);
    const contaDestino = jsonDB.contas.find((conta)=> +conta.numero === +numero_conta_destino);

    if(!numero_conta_origem, !numero_conta_destino, !valor, !senha){
        return res.status(403).json({
            mensagem: "O numero da conta Origem , a conta destino , a senha e o valor são obrigatorios !"
        });
    }
    if(!contaOrigem){
        return res.status(403).json({
            mensagem: "Conta origem não encontrada !"
        });
    }
    if(!contaDestino){
        return res.status(403).json({
            mensagem: "Conta destino não encontrada !"
        });
    }
    if(contaOrigem.usuario.senha !== senha){
        return res.status(403).json({
            mensagem: "Senha incorreta !"
        });
    }
    if(contaOrigem.saldo === 0){
        return res.status(403).json({
            mensagem: "A conta não possui saldo !"
        });
    }
    if(contaOrigem.saldo < valor){
        return res.status(403).json({
            mensagem: "Valor insuficiente para transferência !"
        });
    }

    contaOrigem.saldo -= +valor;
    contaDestino.saldo += +valor;

    jsonDB.transferencias.push({
        "data": data,
        "numero_conta_origem": numero_conta_origem,
        "numero_conta_destino": numero_conta_destino,
        "valor": +valor
    })
    try{
        
        await writeDB(jsonDB)
        res.status(203).json();
        
    }
    catch(e){
        return res.status(500).json(e)
    }

}

const searchUserSaldo = async (req,res) =>{
    const {numero_conta, senha} = req.query;
    const jsonDB = await readDB()
    const contaEncontrada = jsonDB.contas.find((conta)=> +conta.numero === +numero_conta);

    if(!numero_conta || !senha){
        return res.status(403).json({
            mensagem: "O numero da conta e a senha  são obrigatorios !"
        });
    }
    if(!contaEncontrada){
        return res.status(403).json({
            mensagem: "A conta bancária não foi encontrada !"
        });
    }
    if(contaEncontrada.usuario.senha !== senha){
        return res.status(403).json({
            mensagem: "A senha está incorreta !"
        });
    }

         return res.status(201).json({
             "saldo": contaEncontrada.saldo
         })

}

const userExtrato = async (req,res) =>{
    const {numero_conta, senha} = req.query;
    const jsonDB = await readDB()
    const contaEncontrada = jsonDB.contas.find((conta)=> +conta.numero === +numero_conta);
    const buscarDepositos = jsonDB.depositos.filter((deposito) => +deposito.numero_conta === +numero_conta )
    const buscarSaques = jsonDB.saques.filter((saque) => +saque.numero_conta === +numero_conta )
    const buscarTransferenciasEnviadas = jsonDB.transferencias.filter((transferencia) => +transferencia.numero_conta_origem === +numero_conta )
    const buscarTransferenciasRecebidas = jsonDB.transferencias.filter((transferencia) => +transferencia.numero_conta_destino === +numero_conta )

    if(!numero_conta || !senha){
        return res.status(403).json({
            mensagem: "O numero da conta e a senha  são obrigatorios !"
        });
    }
    if(!contaEncontrada){
         return res.status(403).json({
             mensagem: "A conta bancária não foi encontrada !"
         });
    }
     
    if(contaEncontrada.usuario.senha !== senha){
        return res.status(403).json({
            mensagem: "Senha incorreta !"
        });
    }
    return res.status(201).json({
            "depositos": buscarDepositos.length === 0 ? 'Não foi encontrado nenhum deposito .' : buscarDepositos,
            "saques": buscarSaques.length === 0 ? 'Não foi encontrado nenhum saque .' : buscarSaques,
            "transferenciasEnviadas": buscarTransferenciasEnviadas.length === 0 ? 'Não foi encontrada nenhuma transferência enviada .' : buscarTransferenciasEnviadas,
            "transferenciasRecebidas": buscarTransferenciasRecebidas.length === 0 ? 'Não foi encontrada nenhuma transferência recebida .' : buscarTransferenciasRecebidas
    })
}

module.exports = {
    getAccounts,
    createAccount,
    editUser,
    deleteUser,
    userDeposit,
    userWithdraw,
    userTransfer,
    searchUserSaldo,
    userExtrato
}