const connection = require('./connections')
let ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function getUsuarios() {
    const clientMongo = await connection.getConnection();
    const usuarios = await clientMongo
    .db('homebanking')
    .collection('users')
    .find()
    .toArray();
    return usuarios;
 }

 async function findUser(body){
    const clientMongo = await connection.getConnection();
    const usuario = await clientMongo
    .db('homebanking')
    .collection('users')
    .findOne({email: body.email})

     const isMatch =  bcrypt.compareSync(body.password, usuario.password);
     
     if(!usuario || !isMatch){
         throw new Error('Usuario o Password invalida');
     } 

    return usuario
 }

 async function addUser(user){
    const connectiondb = await connection.getConnection();
    user.password = bcrypt.hashSync(user.password, 8);
  
    const result = await connectiondb.db('homebanking')
                            .collection('users')
                            .insertOne(user);
    return result;
  }

  async function generateJWT(user){
    const token = jwt.sign({_id: user._id, email: user.apellido}, process.env.SECRET, {expiresIn: '1h'});
    return token;
  }

   async function updateSaldo(saldo, user){

      console.log(user);
      console.log(saldo);
      const connectiondb = await connection.getConnection();
      var newvalues = { $set: {saldo: user.saldo + saldo} }
      const query = { _id: new ObjectId(user._id)}

      const result = await connectiondb.db('homebanking')
                            .collection('users')
                            .updateOne(query, newvalues, function(err, res) {
                              if (err) throw err;
                              console.log("1 document updated")});

      return result
   }
 module.exports = {getUsuarios, findUser, addUser, generateJWT, updateSaldo}