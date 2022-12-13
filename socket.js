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
 	seen:String,
 	image:String,
 	date:{type:Date,default:Date.now}
 })
 var chat=mongoose.model("chat",chatSchema)

var notiSchema=new mongoose.Schema({

 	image:String,
 	name:String,
 	uid:String,
 	seen:String,
 	date:{type:Date,default:Date.now}
 })
 var noti=mongoose.model("noti",notiSchema)

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
    which:String,
    status:String,
    image:String,
    type:String,
    chats:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"chat"
 
    }],
   notis:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"noti"
 
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



function aboutm(ids,uids){

    user.findById(ids).populate("chats").exec(function(err,alluser){

    user.findOne({_id:uids},function(err,another){
        	 for (var i=0;i<alluser.chats.length;i++){

    	 	if(alluser.chats[i].from==uids && alluser.chats[i].to==ids){

    	 		 chat.findById(alluser.chats[i]._id,function(err,info){

    	 		 	 info.updateOne({seen:"yes"},function(err,infos){

    	 		 	 })
    	 		 })
    	 	}
    	 }
      alluser.updateOne({which:another._id},function(err,info){
              

      })
  
    })
})
}

io.on("connection",function(socket){
 console.log("hitted")
function dones(){
 socket.broadcast.emit("done",{data:""})  

  

}
socket.emit("online",{data:""})  
socket.emit("seen",{data:""})  
socket.emit("which",{data:""})  
socket.emit("textEvent",{data:""})  
socket.emit("newNotification",{data:""})  
 
 socket.on("whichclean",function(data){
   
   user.findById(data.id,function(err,alluser){
   alluser.updateOne({which:""},function(err,info){

   })
})
 })
 socket.on("seenMessage",function(data){
   console.log("now hitting here")

aboutm(data.id,data.uid)

  setTimeout(dones,1000)


})
 socket.on("onlineStatus",function(data){
 
socket.userid=data.id
 user.findById(data.id,function(err,users){

         	 users.updateOne({status:"online"},function(err,info){
                 
                     
                  
         	 })
         })

   socket.broadcast.emit("someOn",{data:""})

})

function sendn(){
 socket.broadcast.emit("notification",{data:""})  

  

}

   socket.on("noti",function(data){
    
      user.findById(data.id).populate("chats").exec(function(err,userone){

   	 user.findOne({_id:data.uid}).populate("chats").populate("notis").exec(function(err,usertwo){
console.log("for notification")
        

          if(usertwo.which!==data.id){ 
   	     
   	     if(userone.image){

   	     	 var image=userone.image
   	     } 		
   	     else{

           var image=""
          }
       
           var flag=true
          for(var i=0;i<usertwo.notis.length;i++){

          	if(usertwo.notis[i].uid==data.id){

          		flag=false
          		break
          	}
          }
          if(flag==true){
                    noti.create({uid:userone._id,image:image,name:userone.name,seen:"no",date:Date.now()},function(err,nots){
 
            if(usertwo.notis.length>0){

            	var p=usertwo.notis.length-1
            	usertwo.notis.push(0)
                while (p!==-1){

                	usertwo.notis[p+1]=usertwo.notis[p]
                	p=p-1

                }
               usertwo.notis[p+1]=nots 

             }
             else{

             	usertwo.notis.push(nots)
             }
           usertwo.save()
        

           setTimeout(sendn,1000)
         })
         }
         
        
    }
})
  })
   })

   socket.on("message",function(data){


   	 socket.broadcast.emit("texts",{text:data.text})
   })
 
 socket.on("typingOn",function(data){
  user.findById(data.two,function(err,victim){
    
    if(victim.which==data.userid){ 
   	 socket.broadcast.emit("tOn",{text:""})
     console.log(data.two)
     }
   })
 })    

socket.on("typingOff",function(data){
user.findById(data.two,function(err,victim){
   if(victim.which==data.userid){
   	 socket.broadcast.emit("tOff",{text:""})
    
  }
   })
   }) 
    socket.on("disconnect",function(data){
    // socket.emit("offline",{data:""})  


                             user.findById(socket.userid,function(err,userss){

         	 userss.updateOne({status:"off"},function(err,info){
               userss.which="" 
               userss.save()                

         	 })
         }) 
         socket.broadcast.emit("someOff",{data:""})
                  	 	 	
   
   

  

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
 
 user.findById(req.user._id).populate("notis").exec(function(err,usersnoti){
  if(req.query.find){
  
		     	 user.find({first:{$regex:req.query.find,$options:"$i"}},function(err,users){

		     	 	  if(users.length>0){  
		     	 	    res.render("alluser.ejs",{user:users,data:req.query.find,usernoti:usersnoti})
                         }
                         else{
                         	    	                           res.send("<h1 align=center style=padding-top:200px>No User Found</h1>")

                         }
		     	 
		     	
		       })
		     
		     
		 
          

	
    

    
}

else{

 
    user.find({},function(err,users){
     res.render("alluser.ejs",{user:users,usernoti:usersnoti,data:""})


 })

}
})
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
   
   user.findById(req.body.id).populate("chats").exec(function(err,userones){

   	 user.findOne({_id:req.body.uid}).populate("chats").populate("notis").exec(function(err,usertwos){
     

       if(userones.which==usertwos._id && usertwos.which==userones._id){

          var seen="yes"
       }
       else{

       	  var seen="no"
       }
   if(userones.image){

   	 var image=userones.image
   }
else{

	var image=""
}

   	 	 chat.create({text:req.body.text,from:req.body.id,to:req.body.uid,name:userones.first,image:image,date:Date.now(),seen:seen},function(err,texts){

             var i=userones.chats.length-1
             var j=usertwos.chats.length-1
             userones.chats.push(0)
             while (i!==-1){
                 userones.chats[i+1]=userones.chats[i]
                 i=i-1

             }
             userones.chats[i+1]=texts
             userones.save()
   	 	 	 usertwos.chats.push(0)
             while (j!==-1){
                 usertwos.chats[j+1]=usertwos.chats[j]
                 j=j-1

             }
             usertwos.chats[j+1]=texts
   	 	 	 usertwos.save()
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

app.get("/chatNoti/:uid/:id/:nid",islogged,function(req,res){

  noti.findByIdAndDelete(req.params.nid,function(err,info){

  	 res.redirect(`/chat/${req.params.uid}/${req.params.id}`)
  })
})
app.get("/chat/:uid/:id",islogged,function(req,res){
   

 user.findById(req.user._id).populate("chats").populate("notis").exec(function(err,users){   
  
for(var j=0;j<users.notis.length;j++){

	if(users.notis[j].uid==req.params.uid){

		 noti.findByIdAndDelete(users.notis[j]._id,function(err,info){
		 	
		 })
	}
}
   var flag=true
   for (var i=0;i<users.chats.length;i++){

   	 if(users.chats[i].from==req.user._id && users.chats[i].to==req.params.uid || users.chats[i].from==req.params.uid && users.chats[i].to==req.user._id){
     
        flag=false
        break

   	 }
   }
   if(flag==true){

   	 var found="yes"
   }
   else if(flag==false){
        var found="no"
   }
 user.findOne({_id:req.params.uid}).populate("chats").exec(function(err,another){   
 

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

   res.render("chat.ejs",{uid:req.params.uid,id:req.params.id,user:users,victim:another,found:found})
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

