const connection = require('./connections')
let ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sleep = require('util').promisify(setTimeout);

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

async function searchToken(req){
   const clientMongo = await connection.getConnection();
   const usuario = await clientMongo
   .db('homebanking')
   .collection('users')
   .findOne({email: req.body});

   return usuario;
}

  async function generateJWT(user){
    const token = jwt.sign({_id: user._id, email: user.apellido}, process.env.SECRET, {expiresIn: '1h'});
    return token;
  }

   async function updatePesos(pesos, user){

      if(-pesos > user.pesos){
         throw new Error('Imposible de realizar la extraccion solicitada')
      }

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

   
   async function updateDolares(dolares, user){

      if(-dolares > user.dolares){
         throw new Error('Imposible de realizar la extraccion solicitada')
      }

      console.log(user);
      console.log(dolares);
      const connectiondb = await connection.getConnection();
      var newvalues = { $set: {dolares: user.dolares + dolares} }
      const query = { _id: new ObjectId(user._id)}

      const result = await connectiondb.db('homebanking')
                            .collection('users')
                            .updateOne(query, newvalues, function(err, res) {
                              if (err) throw err;
                              console.log("1 document updated")});

      return result
   }

   async function conversionMoneda(body, user){

      const connectiondb = await connection.getConnection();
      if(body.pesos){
       if(body.pesos > user.pesos){
          throw new Error('Imposible de realizar la extraccion solicitada')
       }

       const montoPesos = await updatePesos(-body.pesos, user);
       var newvalues = { $set: {dolares: user.dolares + (body.pesos / 200)} }

                             }else{
                              if(body.dolares > user.dolares){
                                          throw new Error('Imposible de realizar la extraccion solicitada')
                                       }
                                       const montoDolares = await updateDolares(-body.dolares, user);
                                       var newvalues = { $set: {pesos: user.pesos + (body.dolares * 200)} }
                             }
                             const query = { _id: new ObjectId(user._id)}

                             const result = await connectiondb.db('homebanking')
                             .collection('users')
                             .updateOne(query, newvalues, function(err, res) {
                               if (err) throw err;
                               console.log("1 document updated")});

      return result

   }

   async function inversiones(req, user) {

      const montoPesos = await updatePesos(-req.body.pesos, user);


       var interes = (req.body.pesos + ((req.body.pesos * 5) / 100))

       console.log('interes: ', interes);

      //  var finalUser = await searchToken(req.header)

      //  console.log('cuenta actual: ', finalUser.pesos);

       var result = await updatePesos(interes, finalUser)

      //  console.log('Result: ', result);

       
      //  console.log('FinalUser cuenta: ', finalUser.pesos);

      return result
   
      }

 module.exports = {getUsuarios, findUser, addUser, generateJWT, updatePesos, conversionMoneda, inversiones, searchToken}

 