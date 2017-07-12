var express  = require('express'),
    path     = require('path'),
    bodyParser = require('body-parser'),
    app = express(),
    expressValidator = require('express-validator');


/*Set EJS template Engine*/
app.set('views','./views');
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true })); //support x-www-form-urlencoded
app.use(bodyParser.json());
app.use(expressValidator());

/*MySql connection*/
var connection  = require('express-myconnection'),
    mysql = require('mysql');

app.use(

    connection(mysql,{
        host     : 'localhost',
        user     : 'root',
        password : 'root',
        port     : 3306, //port mysql
        // database :'test',
        database :'unespin',
        debug    : true //set true if you wanna see debug logger
    },'request')

);

app.get('/',function(req,res){
    res.send('Welcome');
});


//RESTful route
var router = express.Router();


/*------------------------------------------------------
*  This is router middleware,invoked everytime
*  we hit url /api and anything after /api
*  like /api/user , /api/user/7
*  we can use this for doing validation,authetication
*  for every route started with /api
--------------------------------------------------------*/
router.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});

//Home page
var curut = router.route('/user');

//show the CRUD interface | GET
curut.get(function(req,res,next){


    req.getConnection(function(err,conn){

        if (err) return next("Cannot Connect");

        var query = conn.query('SELECT data, nome, local_evento, categoria, id FROM Evento',function(err,rows){
            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }

            res.render('user',{title:"RESTful Crud Example",data:rows});

         });

    });

});
//post data to DB | POST
curut.post(function(req,res,next){

    //validation
    // req.assert('nome','Nome é necessário').notEmpty();
    // req.assert('data','Data não pode ser um campo vazio').notEmpty();
    // req.assert('hora_inicio','horario de inicio nao pode ser vazio').notEmpty;
	// req.assert('responsavel','responsavel é necessário').notEmpty();
	// req.assert('org_responsavel','Organização responsável é necessário').notEmpty();
	// req.assert('local_evento','Local é necessário').notEmpty();
    //
    // var errors = req.validationErrors();
    // if(errors){
    //     res.status(422).json(errors);
    //     return;
    // }

    //get data
    var data = {
        nome:req.body.nome_pesquisa,
        local_evento:req.body.local_pesquisa
     };

    req.getConnection(function (err, conn){

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "select data, nome, local_evento, categoria "+
            "from Evento "+
            "where nome like '%?%' or "+
                        "local_evento like '%?%'"
            ,[data.nome_pesquisa, data.local_pesquisa], function(err, rows){

           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }
           res.render('user',{title:"RESTful Crud Example",data:rows});
        //   res.sendStatus(200);

        });

     });

});


//Update Page
var curut2 = router.route('/user/:id');

//get data to update
curut2.get(function(req,res,next){

    var id = req.params.id;

    req.getConnection(function(err,conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("SELECT * FROM Evento WHERE id = ? ",[id],function(err,rows){

            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }

            //if user not found
            if(rows.length < 1)
                return res.send("User Not found");

            res.render('edit',{title:"Edit user",data:rows});
        });

    });

});

//update data
curut2.put(function(req,res,next){
    var id = req.params.id;

    //validation
    req.assert('nome','Nome é necessário').notEmpty();
    req.assert('data','Data não pode ser um campo vazio').notEmpty();
    req.assert('hora_inicio','horario de inicio nao pode ser vazio').notEmpty;
	req.assert('responsavel','responsavel é necessário').notEmpty();
	req.assert('org_responsavel','Organização responsável é necessário').notEmpty();
	req.assert('local_evento','Local é necessário').notEmpty();

    var errors = req.validationErrors();
    if(errors){
        res.status(422).json(errors);
        return;
    }

    //get data
    var data = {
        nome:req.body.nome,
        data:req.body.data,
        hora_inicio:req.body.hora_inicio,
		link_facebook:req.body.link_facebook,
		responsavel:req.body.responsavel,
		org_responsavel:req.body.org_responsavel,
		categoria:req.body.categoria,
		local_evento:req.body.local_evento,
		descricao:req.body.descricao,
     };

    //inserting into mysql
    req.getConnection(function (err, conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("UPDATE Evento set ? WHERE id = ? ",[data,id], function(err, rows){

           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }

          res.sendStatus(200);

        });

     });

});

//delete data
curut2.delete(function(req,res,next){

    var id = req.params.id;

     req.getConnection(function (err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query("DELETE FROM Evento  WHERE id = ? ",[id], function(err, rows){

             if(err){
                console.log(err);
                return next("Mysql error, check your query");
             }

             res.sendStatus(200);

        });
        //console.log(query.sql);

     });
});


//Add Page
var curut3 = router.route('/add');

curut3.get(function(req,res,next){

	var id = req.params.id;
    req.getConnection(function(err,conn){
        if (err) return next("Cannot Connect");

        var query1 = conn.query('   select id_local, id_org, nome_org, nome_local  from Organizacao, Local  where id_local = id_org; ',function(err,rows){

            console.log(rows)
            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }

            res.render('add',{title:"RESTful Crud Example",data:rows});

         });

    });


});

//Add data to BD
curut3.post(function(req,res,next){

    //validation
    // req.assert('nome','Nome é necessário').notEmpty();
    // req.assert('data','Data não pode ser um campo vazio').notEmpty();
    // req.assert('hora_inicio','horario de inicio nao pode ser vazio').notEmpty();
	// req.assert('responsavel','responsavel é necessário').notEmpty();
	// req.assert('org_responsavel','Organização responsável é necessário').notEmpty();
	// req.assert('local_evento','Local é necessário').notEmpty();
    //
    // var errors = req.validationErrors();
    // if(errors){
    //     res.status(422).json(errors);
    //     return;
    // }

    //get data
    var data = {

        nome:req.body.nome,
        data:req.body.data,
        hora_inicio:req.body.hora_inicio,
        link_facebook:req.body.link_facebook,
        responsavel:req.body.responsavel,
        org_responsavel:req.body.org_responsavel,
        categoria:req.body.categoria,
        local_evento:req.body.local_evento,
        descricao:req.body.descricao,
     };

     console.log(req.body.org_responsavel);

    //inserting into mysql
    req.getConnection(function (err, conn){

        if (err) return next("Cannot Connect");

        var query = conn.query("INSERT INTO Evento set ? ",data, function(err, rows){

           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }

          res.sendStatus(200);

        });

     });

});

//Data Page
var curut4 = router.route('/event');

//Show Data attributes
curut4.get(function(req,res,next){

	var id = req.params.id;
    req.getConnection(function(err,conn){

        if (err) return next("Cannot Connect");

        var query = conn.query('SELECT * FROM Evento',function(err,rows){

            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }

            res.render('event',{title:"RESTful Crud Example",data:rows});

         });

    });
});

//now we need to apply our router here
app.use('/api', router);

//start Server
var server = app.listen(3000,function(){

   console.log("Listening to port %s",server.address().port);

});
