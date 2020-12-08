var express = require('express');
var router = express.Router();

/* GET users listing. */
router.use('/', function(req, res, next) {
  console.log(req.url)
  if (req.url === "/cool/"){
    res.send("You're so cool")
  }
  else res.send('respond with a resource');
});

module.exports = router;
