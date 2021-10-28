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

    if(!usuario){
      throw new Error('Usuario o Password invalida');
    }

     const isMatch =  bcrypt.compareSync(body.password, usuario.password);
     
     if(!isMatch){
         throw new Error('Usuario o Password invalida');
     } 

    return usuario
 }

 async function addUser(user){

   const emailExistente = await searchEmail(user.email)

   if(emailExistente){
      throw new Error('El Email pertenece a una cuenta anteriormente creada')
   }

    const connectiondb = await connection.getConnection();
    user.password = bcrypt.hashSync(user.password, 8);
  
    const result = await connectiondb.db('homebanking')
                            .collection('users')
                            .insertOne({name: user.name,
                                        lastname: user.lastname,
                                        email: user.email,
                                        password: user.password,
                                        pesos: 0,
                                        dolares: 0});
    return result;
  }
  
  async function searchEmail(email){
   const clientMongo = await connection.getConnection();
   const usuario = await clientMongo
   .db('homebanking')
   .collection('users')
   .findOne({email: email})

   return usuario
}

  async function generateJWT(user){
    const token = jwt.sign({_id: user._id, email: user.apellido}, process.env.SECRET, {expiresIn: '1h'});
    return token;
  }

   async function updatePesos(pesos, user){

      console.log(user);
      console.log(pesos);
      const connectiondb = await connection.getConnection();
      var newvalues = { $set: {pesos: user.pesos + pesos} }
      const query = { _id: new ObjectId(user._id)}

      const result = await connectiondb.db('homebanking')
                            .collection('users')
                            .updateOne(query, newvalues, function(err, res) {
                              if (err) throw err;
                              console.log("1 document updated")});

      return result
   }

   async function cambioDolar(body, user){
      const connectiondb = await connection.getConnection();

      const montoPesos = await updatePesos(-body.pesos, user);

      var newvalues = { $set: {dolares: user.dolares + (body.pesos / 200)} }
      const query = { _id: new ObjectId(user._id)}

      const result = await connectiondb.db('homebanking')
                            .collection('users')
                            .updateOne(query, newvalues, function(err, res) {
                              if (err) throw err;
                              console.log("1 document updated")});

      return result

   }
 module.exports = {getUsuarios, findUser, addUser, generateJWT, updatePesos, cambioDolar}