var express = require('express');
const jwt  = require("jsonwebtoken");
var router = express.Router();
const User = require('../data/db/usuariosdb')
const auth = require('../middleware/auth')
require('dotenv').config();


router.get('/', async function(req, res, next) {
  const usuario = await User.getUsuarios();
    res.json(usuario);  
  });

  router.get('/cuenta', auth, async function (req, res) {

    jwt.verify(req.token, process.env.SECRET, async (error, authData) =>{
  
      if(error){
        res.sendStatus(403)
      }else{
       const user = await User.searchToken(authData)
        res.json(user)
      }
    })
  })
  
router.post('/', async (req, res) => {
  try{
  const result = await User.addUser(req.body);
  res.json(result);
  }catch(error){
    res.status(401).send(error.message)
  }
});

router.post('/login', async (req, res)=>{
  try {
    const user = await User.findUser(req.body);
    console.log(user);
    const token = await User.generateJWT(user);
    console.log("Se ha iniciado sesion");
    res.send({user, token});
  } catch (error) {
    res.status(401).send(error.message);
  }
});

router.put('/depositarExtraerPesos', async (req, res) => {

  try{
  const user = await User.searchToken(req.header);

  const depositado = await User.updatePesos(req.body.pesos, user)

  const userFinal = await User.findUser(req.body);

  res.send(userFinal)
  } catch (error){
    
    res.status(401).send(error.message);
  }
});

router.put('/conversionMoneda', async (req, res)=>{
  
  try{
  const user = await User.searchToken(req.header);

  const depositado = await User.conversionMoneda(req.body, user)

  const userFinal = await User.searchToken(req.header);

  res.send(userFinal)
  }catch(error){

    res.status(401).send(error.message)
  }
});

router.put('/inversion', auth, async (req, res)=>{
  
    jwt.verify(req.token, process.env.SECRET, async (error, authData) =>{

     if(error){
       res.sendStatus(403)
     }else{
      const user = await User.searchToken(authData)
      const invertido = await User.inversiones(req, user)

      console.log(authData._id);
       res.json(invertido)
     }
  })
})




module.exports = router;
