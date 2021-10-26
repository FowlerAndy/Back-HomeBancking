var express = require('express');
var router = express.Router();
const User = require('../data/db/usuariosdb')
/* GET users listing. */

router.get('/', async function(req, res, next) {
  const usuario = await User.getUsuarios();
    res.json(usuario);  
  });

router.get('/me', async function(req, res, next){
  const usuario = await User.findUser(req.body)
  res.json(usuario)
})

router.post('/', async (req, res) => {
  const result = await User.addUser(req.body);
  res.json(result);
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

module.exports = router;
