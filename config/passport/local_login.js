var LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true
}, function(req,email,password,done){
    console.log('passport의 local-login호출됨. : '+ email + ', ' +password);
    
    var database = app.get('database');
    database.UserModel.findOne({'email':email}, function(err, user){
        if(err){
            console.log('에러 발생함.');
            
            return done(err);
        }
        
        if(!user){
            console.log('사용자 아이디가 일치하지 않습니다.');
            return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다.'));
        }
        
        var authenticated = user.authenticate(password, user._doc.salt, user._doc.hashed_password);
        
        if(!authenticated){
            console.log('비밀번호가 일치하지 않습니다.');
            return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다.'));
        }
        //여기부터는 로그인이 모두 된 경우이다.
        console.log('아이디와 비밀번호가 일치합니다.');
        return done(null, user);
    });
})