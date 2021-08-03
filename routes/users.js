var express = require('express');
var router = express.Router();
var User = require('../models/User');
var util = require('../util');

// New 1
router.get('/new', function(req, res){
  var user = req.flash('user')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('users/new', { user:user, errors:errors }); // 는 username을 id대신 사용
});

// create 2
router.post('/', function(req, res){
  User.create(req.body, function(err, user){
    if(err){
      req.flash('user', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/users/new');
    }
    res.redirect('/');
  });
});

// show 3
router.get('/:username', util.isLoggedin, checkPermission, function(req, res){
  User.findOne({username:req.params.username}, function(err, user){
    if(err) return res.json(err);
    res.render('users/show', {user:user});
  });
});

// edit 4
router.get('/:username/edit', util.isLoggedin, checkPermission, function(req, res){
  var user = req.flash('user')[0];
  var errors = req.flash('errors')[0] || {};
  if(!user){
    User.findOne({username:req.params.username}, function(err, user){
      if(err) return res.json(err);
      res.render('users/edit', { username:req.params.username, user:user, errors:errors });
    });
  }
  else {
    res.render('users/edit', { username:req.params.username, user:user, errors:errors });
  }
});

// update 2
router.put('/:username', util.isLoggedin, checkPermission, function(req, res, next){
  User.findOne({username:req.params.username}) // 값을 찾은 후에 값을 수정하고 user.save함수로 값을 저장
    .select('password') // select함수로 기본적으로 읽어오게 되어 있는 항목을 안 읽어오게 할 수도 있는데 이때는 항목이름 앞에 -를 붙이면 됩
    .exec(function(err, user){ // 예를들어 password를 읽어오고, name을 안 읽어오게 하고 싶다면 .select('password -name')
      if(err) return res.json(err);

      // update user object
      user.originalPassword = user.password;
      user.password = req.body.newPassword? req.body.newPassword : user.password; // user의 update(회원 정보 수정)은 password를 업데이트 하는 경우와, 
                                                                          //password를 업데이트 하지 않는 경우로 나눌 수 있는데, 이에 따라 user.password의 값이 바뀝
      for(var p in req.body){ // user는 DB에서 읽어온 data이고, req.body가 실제 form으로 입력된 값
        user[p] = req.body[p];
      }

      // save updated user
      user.save(function(err, user){
        if(err){
          req.flash('user', req.body);
          req.flash('errors', util.parseError(err));
          return res.redirect('/users/'+req.params.username+'/edit');
        }
        res.redirect('/users/'+user.username);
      });
  });
});

module.exports = router;

// private functions
function checkPermission(req, res, next){
  User.findOne({username:req.params.username}, function(err, user){
    if(err) return res.json(err);
    if(user.id != req.user.id) return util.noPermission(req, res);

    next();
  });
}
