var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// schema
var userSchema = mongoose.Schema({
  username:{
    type:String,
    required:[true,'Username is required!'], // 배열을 사용해서 에러메세지 내용을 원하는 대로 변경할 수 있습니다.
    match:[/^.{4,12}$/,'Should be 4-12 characters!'],
    trim:true,
    unique:true
  },
  password:{
    type:String,
    required:[true,'Password is required!'],
    select:false // DB에서 값을 읽어오지 않게 설정
  },
  name:{
    type:String,
    required:[true,'Name is required!'],
    match:[/^.{4,12}$/,'Should be 4-12 characters!'],
    trim:true
  },
  email:{
    type:String,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'Should be a vaild email address!'],
    trim:true
  }
},{
  toObject:{virtuals:true}
});

// virtuals 회원가입, 회원정보 수정을 위해 필요한 항목이지만, DB에 저장할 필요는 없는 값은 virtual로 만듬
userSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual('originalPassword')
  .get(function(){ return this._originalPassword; })
  .set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword')
  .get(function(){ return this._currentPassword; })
  .set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword')
  .get(function(){ return this._newPassword; })
  .set(function(value){ this._newPassword=value; });

// password validation   
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
var passwordRegexErrorMessage = 'Should be minimum 8 characters of alphabet and number combination!';
userSchema.path('password').validate(function(v) { // password를 DB에 생성, 수정하기 전에 값이 유효(valid)한지 확인(validate)
  var user = this; //validation callback 함수 속에서 this는 user model입니다. 헷갈리지 않도록 user 변수에 넣음

  // create user  
  // 회원가입의 경우 password confirmation값이 없는 경우와, password값이 password confirmation값과 다른 경우에 
  // 유효하지않음처리(invalidate)를 하게 됩니다. 
  // model.invalidate함수를 사용하며, 첫번째는 인자로 항목이름, 두번째 인자로 에러메세지
  if(user.isNew){ // model.isNew 항목은 해당 모델이 생성되는 경우에는 true, 아니면 false의 값을 가집니다.
    if(!user.passwordConfirmation){ // password validation이 '회원가입' 단계인지, 아니면 '회원 정보 수정'단계인지를 알 수 있
      user.invalidate('passwordConfirmation', 'Password Confirmation is required.');
    }

  // password confirmation값이 없는 경우와, 
   // password값이 password confirmation값과 다른 경우에 유효하지않음처리(invalidate)를 하게 됩니다. 
    if(!passwordRegex.test(user.password)){
      user.invalidate('password', passwordRegexErrorMessage);
    }
    else if(user.password !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
  }

  // update user 

  if(!user.isNew){
    if(!user.currentPassword){ //  current password값이 없는 경우
      user.invalidate('currentPassword', 'Current Password is required!'); //첫번째는 인자로 항목이름, 두번째 인자로 에러메세지
    }
    else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){ //current password값이 original password값과 다른 경우

      user.invalidate('currentPassword', 'Current Password is invalid!');
    }

    if(user.newPassword && !passwordRegex.test(user.newPassword)){ 
      user.invalidate("newPassword", passwordRegexErrorMessage);
    }
    else if(user.newPassword !== user.passwordConfirmation) { // new password값과 password confirmation값이 다른 경우
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
  }
});

// hash password
userSchema.pre('save', function (next){
  var user = this;
  if(!user.isModified('password')){
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

// model methods
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password);
};

// model & export
var User = mongoose.model('user',userSchema);
module.exports = User;
