'use strict';
var router = require('express').Router();
module.exports = router;
var db = require('../../db')
var Order = db.model('order')
var User = db.model('user')
var Promise = require('bluebird')
  // GET Routes
router.get('/', function(req, res, next) {
  //check the session ID and make sure user isAdmin
  if (req.user.status !== 'admin') {
    res.status(403).send('Forbidden');
    return
  }
  Order.findAll()
    .then(function(orders) {
      // find user for each order
      res.send(orders)
    }).catch(next)
})

router.get('/:userId/:id', function(req, res, next) {
  Order.findById(req.params.id)
    .then(function(order) {
      return Promise.all([order, order.getProducts(), order.getUser()])
    })
    .spread(function(order, products, user) {
      // check the session make sure user isAdmin OR user on current order. need a fix for guests!
      if (req.user.status !== 'admin' || order.userId !== req.params.userId) {
        res.status(403).send('Forbidden');
        return
      }
      res.send({ order: order, products: products, user: user })
    })
    .catch(next)
})
