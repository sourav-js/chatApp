require("dotenv");
var express             =require("express"),
    app                 =express(),
    cron = require('node-cron'),

    flash               =require("connect-flash"),
passport                =require("passport"),
passportlocal           =require("passport-local"),
passportlocalmongoose   =require("passport-local-mongoose"),
http                    =require("http"),
upload              =require("express-fileupload"),
request             =require("request"),

mongoose                =require("mongoose"),
body                    =require("body-parser"),
session                 =require("express-session"),
socket                 =require("socket.io");
let server                 =http.createServer(app);
app.use(body.urlencoded({extended:true}));
app.use(express.json())
MongoStore=require("connect-mongo");
mongoose.connect("mongodb+srv://Socket:xQQPIQ5JY2nA5j8R@cluster0.p8vnb.mongodb.net/sockets?retryWrites=true&w=majority",function(err,info){

}) 

app.use(express.json());
var id=""
var port=process.env.PORT || 3444
app.use(express.static("./public"));


app.use(upload())
app.use(flash())
app.use(session({
    secret:"socket",
    resave:false,
    saveUninitialized:false,
    store:MongoStore.create({
    
    mongoUrl:"mongodb+srv://Socket:xQQPIQ5JY2nA5j8R@cluster0.p8vnb.mongodb.net/sockets?retryWrites=true&w=majority",
    collection:"sessions"

    }),
   cookie:{maxAge:1800*600*1000}
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
     
	 res.locals.currentUser=req.user
     res.locals.success=req.flash("success")
     res.locals.error=req.flash("error")
     next()
})
 var chatSchema=new mongoose.Schema({

 	text:String,
 	name:String,
 	from:String,
 	to:String,
 	image:String,
 	date:{type:Date,default:Date.now}
 })
 var chat=mongoose.model("chat",chatSchema)

var tokenSchema=new mongoose.Schema({

 	code:Number,
 	
 })
 var token=mongoose.model("token",tokenSchema)

 var userSchema=new mongoose.Schema({
    first:String,
    name:String,
    middle:String,
    username:String,
    password:String,
    last:String,
    status:String,
    image:String,
    chats:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"chat"
 
    }]

    
})
userSchema.plugin(passportlocalmongoose)
 var user=mongoose.model("user",userSchema)
passport.use(new passportlocal(user.authenticate()))
passport.serializeUser(user.serializeUser())
passport.deserializeUser(user.deserializeUser())

var io=socket(server)




app.get("/status",function(req,res){

	if(req.user){

         console.log("function called")
         user.findById(req.user._id,function(err,users){

         	 users.updateOne({status:"online"},function(err,info){
                 
                 res.json("json")

         	 })
         })
	}
  
})

app.get("/statusOff",function(req,res){

	if(req.user){

         console.log("function called")
         user.findById(req.user._id,function(err,users){

         	 users.updateOne({status:"off"},function(err,info){
                 
                 res.json("json")

         	 })
         })
	}
  
})

app.get("/testing",function(req,res){
  console.log("hhhhhhhhhhhhhhhhhhhhhhh")
})



io.on("connection",function(socket){
 console.log("hitted")

socket.emit("online",{data:""})  
 


 socket.on("onlineStatus",function(data){
 
socket.userid=data.id
 user.findById(data.id,function(err,users){

         	 users.updateOne({status:"online"},function(err,info){
                 
            
                  
         	 })
         })

   

})


   socket.on("message",function(data){


   	 socket.broadcast.emit("texts",{text:data.text})
   })
 
   

    socket.on("disconnect",function(data){
    // socket.emit("offline",{data:""})  


                             user.findById(socket.userid,function(err,userss){

         	 userss.updateOne({status:"off"},function(err,info){
                 

         	 })
         }) 
                  	 	 	
   
   

  

})    


})

app.get("/login",function(req,res){

   res.render("login.ejs")

})



app.post("/login",passport.authenticate("local",{
successRedirect:"/", 
failureRedirect:"/login"
}),function(req,res){

});

app.get("/",islogged,function(req,res){
 
 if(req.query.find){
  
		     	 user.find({first:{$regex:req.query.find,$options:"$i"}},function(err,users){

		     	 	  if(users.length>0){  
		     	 	    res.render("alluser.ejs",{user:users,data:req.query.find})
                         }
                         else{
                         	    	                           res.send("<h1 align=center style=padding-top:200px>No User Found</h1>")

                         }
		     	 
		     	
		       })
		     
		     
		 
          

	
    

    
}

else{

 
    user.find({},function(err,users){
     res.render("alluser.ejs",{user:users,data:""})


 })

}
})

app.get("/session",function(req,res){

	res.send(req.session)
})

app.get("/logout",function(req,res){
  req.session.passport.user=""
	
    req.flash("success","You have logged out")
	res.redirect("/login")
})

app.post("/registering",islogged,function(req,res){
 user.findOne({username:req.body.username},function(err,user){
  
  if (user!==null){
    req.flash("error","User already exists")
    res.redirect("back")    
  }
  else{
    console.log("here")
    var code=Math.floor(Math.random()*11223)
     token.create({code:code},function(err,info){

     })
      
    

            if(req.body.middle){
            	var middle=req.body.middle
                
            }

           else{

           	var middle=""
           }                        
                
                            res.render("active.ejs",{first:req.body.first,middle:middle,username:req.body.username,last:req.body.last,password:req.body.password,code:code})



}
})
})
app.post("/registered",islogged,function(req,res){
           
            if(req.body.two)
            {
              
              token.findOne({code:req.body.two},function(err,info){
              if (!info)
            {
                      
                  req.flash("error","Your code was wrong,it's destroyed,try again...")
                  res.redirect("/login")
            }
              
            
            
            else{
            token.findByIdAndDelete(info._id,function(err,datas){
             
if(req.body.middle){
            	var middle=req.body.middle
                
                var fullname=req.body.first + " " + req.body.middle + " " + req.body.last
            }

           else{

           	var middle=""
           	   var fullname=req.body.first + " " + req.body.last

           }        
 
             user.register(new user({first:req.body.first,middle:middle,last:req.body.last,name:fullname,username:req.body.username}),req.body.password,function(err,user){
                    
        if(err)
        {
            
                req.flash("error","User already exist with that username");
              res.redirect("/login");  
        }
    else{
            
            
            passport.authenticate("local")(req,res,function(){
                

                req.flash("success","successfully Registered...");
                res.redirect("/");
            });
        }
    })
}); 
}
 })
}
else{
        req.flash("error","Please give the code as input...")
        res.redirect("back")

}
});

app.post("/profile/:id",islogged,function(req,res){
 
  user.findById(req.params.id,function(err,users){

  	 if(req.files){

  	 	 var file=req.files.filename,
  	 	 filesname=file.name;
  	 	 file.mv("./public/"+filesname);
  	 }
    users.updateOne({image:filesname},function(err,info){

    	 res.redirect("back")
    })

  })

})
app.post("/chatCreate",islogged,function(req,res){
   
   user.findById(req.body.id).populate("chats").exec(function(err,userone){

   	 user.findOne({_id:req.body.uid}).populate("chats").exec(function(err,usertwo){

   if(userone.image){

   	 var image=userone.image
   }
else{

	var image=""
}
   	 	 chat.create({text:req.body.text,from:req.body.id,to:req.body.uid,name:userone.first,image:image,date:Date.now()},function(err,texts){

   	 	 	 userone.chats.push(texts)
   	 	 	 usertwo.chats.push(texts)
   	 	 	 userone.save()
   	 	 	 usertwo.save()
   	 	 })
   	 })
   })  
 

})

app.get("/forgot",function(req,res){

	res.render("forgot.ejs")
})

app.post("/forgot",islogged,function(req,res){
if(req.user.username==req.body.username){
	 user.findOne({username:req.body.username},function(err,users){

	 	 if(users){

	 	 	 res.render("set.ejs",{user:users})
	 	 }
	   else{
            req.flash("error","No user found")

	   	 res.redirect("back")
	   }
	 })
   }
   else{
   req.flash("error","Not valid")
   	res.redirect("back")
   }
})
app.post("/setPassword",islogged,function(req,res){
    user.findOne({username:req.body.username},function(err,users){
 
        if (req.body.password==req.body.confirm){

        users.setPassword(req.body.password,function(err,user){
            users.save()
            req.flash("success","Password changed")

            res.redirect("/")
        })
    
    }
    else{
    	            req.flash("error","Password not matched")

        res.redirect("back")
    }

    
 
    })
})

app.get("/chat/:uid/:id",islogged,function(req,res){
   
 user.findById(req.user._id).populate("chats").exec(function(err,users){   
 user.findOne({_id:req.params.uid}).populate("chats").exec(function(err,victim){   
 // var flag=true
 // users.chats.forEach(function(data){

 // 	  if(data.from==users._id && data.to==victim._id || data.to==users._id && data.from==victim._id)
 //     {
 //        flag=false
 //     	return
 //     }
 // })
 // if (flag==true){
 //      var mark="yes"
 // }
 // else{

 // 	 var mark="no"
 // }

   res.render("chat.ejs",{uid:req.params.uid,id:req.params.id,user:users,victim:victim})
})
})
})
function islogged(req,res,next){

	if(req.isAuthenticated()){

		 next()
	}
	else{

		req.flash("error","Do log in first")
		res.redirect("/login")
	}
}
server.listen(port,function(){

	console.log("server started")
})

