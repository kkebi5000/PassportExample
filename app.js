
var express = require('express')
  , http = require('http')
  , path = require('path');
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');
var expressErrorHandler = require('express-error-handler');
var expressSession = require('express-session');
var config = require('./config/config');
var database = require('./database/database');
var route_loader = require('./routes/route_loader');
//passport모듈 사용
var passport = require('passport');
var flash = require('connect-flash');



var app = express();



app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');



console.log('config.server_port : %d', config.server_port);
app.set('port', process.env.PORT || 3000);
 



app.use(bodyParser.urlencoded({ extended: false }))


app.use(bodyParser.json())


app.use('/public', static(path.join(__dirname, 'public')));
 

app.use(cookieParser());

app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));

//passport 초기화
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
 

var configPassport = require('./config/passport');
configPassport(app,passport);

//req.user는 사용자가 요청시 자동으로 만들어지는데 이것을 passport모듈이 사용하고 있기때문에 임의로 수정해주면 passport 모듈을 사용할수 없게된다.


var router = express.Router();
route_loader.init(app, router);


var userPassport = require('./routes/user_passport');
userPassport(router,passport);




var errorHandler = expressErrorHandler({
 static: {
   '404': './public/404.html'
 }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );


process.on('uncaughtException', function (err) {
	console.log('uncaughtException 발생함 : ' + err);
	console.log('서버 프로세스 종료하지 않고 유지함.');
	
	console.log(err.stack);
});


process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

app.on('close', function () {
	console.log("Express 서버 객체가 종료됩니다.");
	if (database.db) {
		database.db.close();
	}
});

 
var server = http.createServer(app).listen(app.get('port'), function(){
	console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

	
	database.init(app, config);
   
});
