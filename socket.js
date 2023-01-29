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
var CryptoJS = require("crypto-js");

app.use(body.urlencoded({extended:true}));
app.use(express.json())
MongoStore=require("connect-mongo");
mongoose.connect("mongodb+srv://Socket:xQQPIQ5JY2nA5j8R@cluster0.p8vnb.mongodb.net/sockets?retryWrites=true&w=majority",function(err,info){

}) 

app.use(express.json());
var id=""
var items=[];
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
    gen:String,
    admin:String,
    id:String,
    type:String,
    grName:String,
    grUser:String,
 	image:String,
 	name:String,
 	uid:String,
 	seen:String,
 	removed:String,
 	date:{type:Date,default:Date.now},
 	inc:Number
 })
 var noti=mongoose.model("noti",notiSchema)




var tokenSchema=new mongoose.Schema({

 	code:Number,
 	
 })
 var token=mongoose.model("token",tokenSchema)

 
var seenSchema=new mongoose.Schema({

 	who:String,
 	id:String,
 	image:String,
 	

 	date:{type:Date,default:Date.now}
}) 	
var seen=mongoose.model("seen",seenSchema)

var messageSchema=new mongoose.Schema({
    text:String,
    from:String,
    to:String,

    name:String,
    date:{type:Date,default:Date.now},

    seens:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"seen"
 
    }]
    
})
var message=mongoose.model("message",messageSchema)
var groupSchema=new mongoose.Schema({

 	image:String,
 	name:String,
 	create:String,
 	cId:String,

 	date:{type:Date,default:Date.now},
 	admins:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"user"
 
    }],
 	users:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"user"
 
    }],
    messages:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"message"
 
     }],
      members:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"user"
 
     }]
    
   })
var group=mongoose.model("group",groupSchema)

var userSchema=new mongoose.Schema({
    first:String,
    admin:String,
    name:String,
    middle:String,
    username:String,
    password:String,
    last:String,
    which:String,
    status:String,
    image:String,
    type:String,
    bio:String,
    
    chats:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"chat"
 
    }],
   notis:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"noti"
 
    }],
     groups:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"group"
 
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





app.get("/sessiontwo",function(req,res){
  req.session.temp=[""]
  req.session.cookie.path=[""]
	res.send(req.session)
})

app.get("/reqs/:pass",function(req,res){
 

   // Encryption
res.send(" ")
  var bytes  = CryptoJS.AES.decrypt("U2FsdGVkX1/2uTmlPZTz9f2v2ETIFfLTXNKT6kCuvwU=", 'secret key 123');
var originalText = bytes.toString(CryptoJS.enc.Utf8);
console.log(bytes)

console.log(originalText)
})


io.on("connection",function(socket){
 console.log("hitted")
function dones(){
 socket.broadcast.emit("done",{data:""})  

  

}

function aboutg(ids,uids){

    user.findById(ids).populate("chats").exec(function(err,alluser){

    group.findOne({_id:uids}).populate("messages").populate("users").exec(function(err,allg){
         
        	 for (var i=0;i<allg.messages.length;i++){
               
                 message.findById(allg.messages[i]._id).populate("seens").exec(function(err,msg){
                     if(msg.from!==alluser._id && msg.to==allg._id){
                      var flag=true
                 	  for(var j=0;j<msg.seens.length;j++){

                 	  	  if(msg.seens[j].id==alluser._id){
                 	  	  	 flag=false
                 	  	  	 break
                 	  	  }
                 	  }
                 	  if(flag==true){
                              
                            if(alluser.image){

                            	 var image=alluser.image
                            }  
                            else{

                            	var image=" "
                 	  	    }
                 	  	     seen.create({who:alluser.name,id:alluser._id,image:image,date:Date.now()},function(err,see){
                             
                             msg.seens.push(see)
                             msg.save()

                        })
                 	  }
                   }
                 })   
    	 	
    	 }
      alluser.updateOne({which:allg._id},function(err,info){
              

      })
            
    })
})
}

socket.emit("online",{data:""})  
socket.emit("someP",{data:""})  
socket.emit("aboutSession",{data:""})  
socket.emit("freshNoti",{data:""})  

socket.emit("seen",{data:""})  
socket.emit("grpseen",{data:""})  
socket.emit("members",{data:""})  

socket.emit("which",{data:""})  
socket.emit("textEvent",{data:""})  
socket.emit("newNotification",{data:""})  
socket.emit("recheck",{data:""})  
 
 socket.on("newNoti",function(data){

console.log("ohkk got it")
  socket.emit("uptoDate",{data:""})  


})

  socket.on("freshing",function(data){

  socket.broadcast.emit("refreshNoti",{data:""})  


})

 socket.on("process",function(data){

  socket.broadcast.emit("freshProcess",{data:""})  


})
 
 socket.on("emitting",function(data){

  socket.broadcast.emit("emitted",{data:""})  


})
 socket.on("whichclean",function(data){
   
   user.findById(data.id,function(err,alluser){
   alluser.updateOne({which:""},function(err,info){

   })
})
 })

 function aboutm(ids,uids){

    user.findById(ids).populate("chats").exec(function(err,alluser){
         
         if(!err)
                 {

         

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
  }
})
}
 socket.on("seenMessage",function(data){
   console.log("now hitting here")

aboutm(data.id,data.uid)

  setTimeout(dones,1000)


})

socket.on("grpseenMessage",function(data){
   console.log("now hitting here")
if(data.mark==false){
 aboutg(data.id,data.uid)
}
  setTimeout(dones,1000)


})

 socket.on("onlineStatus",function(data){
 
socket.userid=data.id
 user.findById(data.id,function(err,users){

         	 users.updateOne({status:"online"},function(err,info){
                 
                     
                  
         	 })
         })

   socket.broadcast.emit("someOn",{data:""})

   socket.broadcast.emit("someOns",{data:""})

})

function sendn(){
 socket.broadcast.emit("notification",{val:"#fresh"})  

  

}

   socket.on("noti",function(data){
    
      user.findById(data.id).populate("chats").exec(function(err,userone){

   	 user.findOne({_id:data.uid}).populate("chats").populate("notis").exec(function(err,usertwo){
        

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
              
              noti.findById(usertwo.notis[i]._id,function(err,nots){

              	nots.updateOne({inc:nots.inc+1,date:Date.now()},function(err,info){


              	})
              })
          		flag=false
          		break
          	}
          }
          if(flag==true){
                    noti.create({uid:userone._id,image:image,name:userone.name,seen:"no",date:Date.now(),inc:1,gen:"normal",type:"normal"},function(err,nots){
 
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
        

         })
    }
         
        
    }
})
  })
                  setTimeout(sendn,1000)

   })


socket.on("grpnoti",function(data){
    
      user.findById(data.id).populate("chats").populate("notis").exec(function(err,userone){

   	 group.findOne({_id:data.uid}).populate("users").exec(function(err,allg){
       
    for(var j=0;j<allg.users.length;j++){
       
       user.findOne({_id:allg.users[j]._id}).populate("notis").exec(function(err,usertwo){ 
         if(usertwo._id!==data.id){
          if(usertwo.which!==data.uid){ 
   	     
   	     
       
           var flag=true
          
          if(flag==true){
              if(allg.image){

   	     	 var image=allg.image
   	     } 		
   	     else{

           var image=""
          }
                    noti.create({uid:allg._id,image:image,name:userone.name,seen:"no",date:Date.now(),inc:1,gen:"grp",type:"normal",grName:allg.name},function(err,nots){
 
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
        

         })
    }
         
        }
    }
})
}
})
  })
                  setTimeout(sendn,1000)

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

socket.on("grptypingOn",function(data){
  user.findById(data.id,function(err,victim){
    
    if(victim.which==data.grpid){ 
   	 socket.broadcast.emit(data.grpid,{name:victim.name,wh:victim.which})
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

socket.on("grptypingOff",function(data){
user.findById(data.id,function(err,victim){
   	if(victim.which==data.grpid){ 
   	 socket.broadcast.emit(data.grpid+"s",{name:" "})
    }
  
   })
   }) 
    socket.on("disconnect",function(data){
    // socket.emit("offline",{data:""})  


                             user.findById(socket.userid,function(err,userss){
           if(userss){
         	 userss.updateOne({status:"off"},function(err,info){
               userss.which="" 
               userss.save()                

         	 })
         	}
         }) 

         socket.broadcast.emit("someOff",{data:""})
         socket.broadcast.emit("someOffs",{data:""})
                  	 	 	
   
   

  

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

app.post("/registering",function(req,res){
	

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

app.post("/createGroup",islogged,function(req,res){

  group.create({name:req.body.groupName,date:Date.now(),create:req.user.name,username:req.user.username,cId:req.user._id},function(err,groupr){
 
   var p=0
   for(var i=0;i<req.session.people.length;i++){
  	 user.findById(req.session.people[i]).populate("groups").populate("notis").exec(function(err,userr){

      noti.create({uid:groupr._id,name:req.user.name,seen:"no",date:Date.now(),inc:1,gen:"grp",type:"create",grName:req.body.groupName},function(err,nots){

         
          if(userr.groups.length>0){

            var ind=userr.groups.length-1
            userr.groups.push(0)
            while (ind!==-1){

            	  userr.groups[ind+1]=userr.groups[ind]
            	  ind=ind-1
            }
            userr.groups[ind+1]=groupr

          } 
          else{         
           
           userr.groups.push(groupr)
          
          }
          userr.notis.push(nots) 
          userr.save()
     groupr.users.push(userr._id)
           p=p+1

     if(p==req.session.people.length)
       {
      	 
       	user.findOne({_id:req.user._id}).populate("groups").exec(function(err,use){

       	 groupr.users.push(req.user._id)
       	 groupr.admins.push(use)
     	 groupr.save()
     	  if(use.groups.length>0){
           
           var ind=use.groups.length-1
           use.groups.push(0)
           while (ind!==-1){
           	 use.groups[ind+1]=use.groups[ind]
           	 ind=ind-1
           }
           use.groups[ind+1]=groupr
     	  }
     	  else{
     	  use.groups.push(groupr)
       	 }
       	 use.save()
     })
       	 
       	
       
       }

      
  	 })
 
 })
  }
     

    
  res.redirect("/memberApi/"+groupr._id)
   })
 
})

app.get("/memberApi/:id",function(req,res){

group.findById(req.params.id,function(err,groupr){
	     user.find({},function(err,all){ 

         var mark=0
        var items=[]
       for(var i=0;i<all.length;i++){
         var flag=true     
   	     for(var j=0;j<req.session.people.length;j++){
      
       	   if(all[i]._id==req.session.people[j]){

       	   	  flag=false
       	   	  break
       	   }
               

   }

   if(flag==true){
   if(all[i].username!==req.user.username){
 	items.push(all[i]._id)
   }
  }
}
 console.log(items)
 console.log(groupr)
 var marks=0
 for(var j=0;j<items.length;j++){
  user.findById(items[j]).populate("groups").populate("notis").exec(function(err,foundone){
     groupr.members.push(foundone._id)
 marks=marks+1
if(marks==items.length)
     {
          groupr.save()      
      }
     
   })

}

 res.redirect("/myGroup/"+req.user._id)
})
}) 
})

app.post("/addMember/:id",islogged,function(req,res){

   group.findById(req.params.id).populate("members").exec(function(err,groupr){
   var  p=0
   	  for(var i=0;i<req.session.people.length;i++){

   	  	  user.findById(req.session.people[i],function(err,userss){
      noti.create({uid:groupr._id,name:req.user.name,seen:"no",date:Date.now(),inc:1,gen:"grp",type:"create",grName:groupr.name},function(err,nots){
            
           
             userss.notis.push(nots)
           if(userss.groups.length>0){
            var ind=userss.groups.length-1
            userss.groups.push(groupr._id)
            while (ind!==-1){
             userss.groups[ind+1]=userss.groups[ind]
             ind=ind-1

            }
            userss.groups[ind+1]=groupr._id
           }
           else{ 
             userss.groups.push(groupr._id)
           } 
            userss.save()

            groupr.users.push(userss._id)

            if(p==req.session.people.length-1){

            	  groupr.save()
            }
            p=p+1
    })

   	  	  })
   	  }
          var mark=0
      	  for(var i=0;i<req.session.people.length;i++){
                   	  
                   	  for(var j=0;j<groupr.members.length;j++){

                     if(req.session.people[i]==groupr.members[j]._id){
              
                       	  	 	  	  groupr.members.splice(j,1)
                                      mark=mark+1
                                      if(mark==req.session.people.length){

                                      	  groupr.save()
                                      
                                      }

                                   break
                  }

             
             }
           }


  
  res.redirect("/Members/"+req.params.id)
})
})
app.get("/myGroup/:uid",islogged,function(req,res){

  if(req.query.find){
    user.findById(req.user._id).populate("notis").populate("groups").exec(function(err,users){
    var items=[]
    var searches=req.query.find
    var search=searches.toLowerCase()         
		     	for(var i=0;i<users.groups.length;i++){

		     		 for(var j=0;j<users.groups[i].name.length;j++){

		     		 	  var k=j
		     		 	  var flag=true
		     		 	  for(var x=0;x<search.length;x++){
                             if(users.groups[i].name[k]){ 
                              var char=users.groups[i].name[k].toLowerCase()
		     		 	  	  }
		     		 	  	  if(char!==search[x]){

		     		 	  	  	  flag=false
		     		 	  	  	  break

		     		 	  	  }
		     		 	      k=k+1
		     		 	  }
		     		     if(flag==true){
                           items.push(users.groups[i])
                           
                           break
		     		     }
		     		 }
		     	}
                   
        if(items.length>0){
         res.render("allgroup.ejs",{user:users,data:req.query.find,usernoti:users,group:[],items:items})
 }
		        
		        else{
                      
                                                  	         res.send("<h1 align=center style=padding-top:200px>No Groups Found</h1>")


		        }
		     
		 
          

	
    
})
    
}

else{

 
    user.findById(req.user._id).populate("groups").populate("notis").exec(function(err,users){
    if(users.groups.length>0){ 	
     var items=[]
     for(var i=0;i<users.groups.length;i++){

     	  items.push(users.groups[i])
     } 	
     res.render("allgroup.ejs",{user:users,data:"",usernoti:users,group:[],items:items})
}
else{
  
                            	         res.send("<h1 align=center style=padding-top:200px>No Groups Found</h1>")


}

 })

}

})

app.post("/reset",islogged,function(req,res){


  	 req.session.people=[]
  	 console.log(req.session.people)
  	 res.redirect("back")
  
})
app.post("/createPeople",islogged,function(req,res){

 
 req.session.people.push(req.body.uid)
 console.log(req.session.people)
res.redirect("back")
})

app.post("/deletePeople",islogged,function(req,res){
var flag=true
for(var i=0;i<req.session.people.length;i++){

   if(req.session.people[i]==req.body.uid){


   	 req.session.people.splice(i,1)
  console.log(req.session.people)

   	 break
   }
}
res.redirect("back")
 
})
app.post("/makeAdmin/:id/:gid",islogged,function(req,res){
  group.findById(req.body.gid).populate("users").populate("admins").exec(function(err,allg){
if(err){

	 console.log(err)
}
else{
 console.log(allg)
  user.findById(req.body.id,function(err,userss){
          if(allg.image){

          	 var image=allg.image
          }
          else{

          	 var image=" "
          }
  	                  
  	                

  
           
           var flag=true  
           for(var j=0;j<allg.admins.length;j++){
                    
                    if(allg.admins[j]._id==userss._id){

                        flag=false
                        break
                    }

           }
           if(flag==true){
  	                    noti.create({uid:allg._id,image:image,name:req.user.name,seen:"no",date:Date.now(),inc:1,gen:"grp",type:"admin",grName:allg.name,id:userss._id,admin:userss.name},function(err,nots){

           	  allg.admins.push(userss)
           	  allg.save()
           	  if (userss.notis.length>0){

           	  	 var ind=userss.notis.length-1
           	  	 userss.notis.push(nots)
           	  	 while (ind!==-1){

           	  	 	 userss.notis[ind+1]=userss.notis[ind]
           	  	 	 ind=ind-1
           	  	 }
           	     userss.notis[ind+1]=nots
           	  }
           	  else{
           	   userss.notis.push(nots)
           	   }
           	   userss.save()
           })
           }
                   
	 
    req.flash(userss.name + "is now admin")
  res.redirect("back")
   })
}
  
  })

})

app.post("/removeAdmin/:id/:gid",islogged,function(req,res){
  group.findById(req.body.gid).populate("users").populate("admins").exec(function(err,allg){
if(err){

	 console.log(err)
}
else{
 console.log(allg)
  user.findById(req.body.id,function(err,userss){
          if(allg.image){

          	 var image=allg.image
          }
          else{

          	 var image=" "
          }
  	                  
  	                

  
           
           var flag=true  
           for(var j=0;j<allg.admins.length;j++){
                    
                    if(allg.admins[j].username==userss.username){
                        allg.admins.splice(j,1)
                        allg.save()
                        break
                    }

           }
          
  	                    noti.create({uid:allg._id,image:image,name:req.user.name,seen:"no",date:Date.now(),inc:1,gen:"grp",type:"removeAdmin",grName:allg.name,id:userss._id,admin:userss.name},function(err,nots){

           	  
           	  if(userss.notis.length>0){
           	     var ind=userss.notis.length-1
           	     userss.notis.push(nots)
           	     while (ind!==-1){

           	     	 userss.notis[ind+1]=userss.notis[ind]
           	     	 ind=ind-1
           	     }
           	    userss.notis[ind+1]=nots
           	  }
              else{
             	   userss.notis.push(nots)
              }
           	   userss.save()
           })
           
                   
	 req.flash(userss.name + "is removed from admin")
  res.redirect("back")
    
   })
}
  
  })

})
app.post("/removeMember",islogged,function(req,res){
var flag=true
user.findById(req.body.uid,function(err,userss){
   

	  group.findById(req.body.gid).populate("users").populate("admins").exec(function(err,allg){

	  	 for(var i=0;i<allg.users.length;i++){

	  	 	  if(allg.users[i]._id==req.body.uid){

	  	 	  	  
                 var flags=true
	  	 	  	  for(var x=0;x<allg.admins.length;x++){

	  	 	  	  	  if(allg.admins[x]._id==req.body.uid){

	  	 	  	  	  	  flags=false
	  	 	  	  	  	  allg.users.splice(i,1)
	  	 	  	          allg.members.push(userss._id)
	  	 	  	          allg.admins.splice(x,1)
	  	 	  	          allg.save()
	  	 	  	  	  	  break
	  	 	  	  	  }
	  	 	  	  }
	  	 	  	  if(flags==true){

	  	 	  	  	 allg.users.splice(i,1)
	  	 	  	  allg.members.push(userss._id)
	  	 	  	  	 allg.save()
	  	 	  	  }

            if(userss._id!==req.user._id){
	     	  
	     	 for(var j=0;j<allg.users.length;j++){
               console.log("all are ok")
               user.findOne({_id:allg.users[j]._id},function(err,found){
                  
              noti.create({id:req.user._id,uid:allg._id,name:req.user.name,seen:"no",date:Date.now(),inc:1,gen:"grp",type:"remove",grName:allg.name,removed:userss.name},function(err,nots){
                    
                   found.notis.push(nots)
                   found.save()
                      
                    })

               })
          } 
	 
	
	     	               noti.create({id:req.user._id,uid:allg._id,name:req.user.name,seen:"no",date:Date.now(),inc:1,gen:"grp",type:"remove",grName:allg.name,removed:"You"},function(err,notown){
                          	  	         
                           userss.notis.push(notown)
                            if(userss.which==allg._id){
                                       userss.which=" "
                             }
                          userss.save()
              })
 
	     }
         	   }
         	   else if(userss._id==req.user._id){

                     
                    if(userss.which==allg._id){
                           userss.which=" "
                                                userss.save()

                     }                       
	     	 for(var j=0;j<allg.users.length;j++){

               user.findOne({_id:allg.users[j]._id},function(err,found){
                  
           
              noti.create({uid:allg._id,name:" ",seen:"no",date:Date.now(),inc:1,gen:"grp",type:"remove",grName:allg.name,removed:userss.name},function(err,nots){
                    
                   found.notis.push(nots)
                   found.save()
                      
                    })

               })
          } 
	 
	
	     	                  


	  	 	  	  break
	  	 	  }
	  	 }
	    
                   
	    
         	   
   
  

   res.redirect("/singleAdmin/"+allg._id)
})
})
}) 

app.get("/singleAdmin/:gid",function(req,res){

  	  group.findById(req.params.gid).populate("users").populate("admins").exec(function(err,allg){
        
        if(allg.users.length==1){

  	  for(var i=0;i<allg.users.length;i++){
                   
  	  	           
  	  	                 user.findOne({_id:allg.users[i]._id},function(err,foundu){
                   var marks=true
                   for(var j=0;j<allg.admins.length;j++){

                   	  if(allg.admins[j]._id==foundu._id){

                               marks=false
                               break
                   	  }
                   }
                   if(marks==true){

                   	 allg.admins.push(foundu._id)
                   	 allg.save()
                                      
                     
                     
                                   noti.create({uid:allg._id,name:" ",seen:"no",date:Date.now(),inc:1,gen:"grp",type:"admin",grName:allg.name,removed:userss.name,id:foundu._id},function(err,notsown){
                                foundu.notis.push(notsown)
                                foundu.save()
})
                   }  
                     

})
  	  }
  }       
    res.redirect("back")
})
})

app.post("/groupDp/:id",function(req,res){

	  if(req.files){

	  	  var file=req.files.filename,
	  	  filesname=file.name;
	  	  file.mv("./public/"+filesname)

         group.findById(req.params.id,function(err,grp){

         	 grp.updateOne({image:filesname},function(err,info){

         	 })
         })	    
	  }
   req.flash("success","Updated")
   res.redirect("back")
})

app.get("/profile/:uid/:id/:gid",function(req,res){
      group.findOne({_id:req.params.gid}).populate("admins").exec(function(err,grp){

   	  if(grp){

   user.findById(req.params.id).populate("groups").exec(function(err,meuser){

        user.findOne({_id:req.params.uid}).populate("groups").exec(function(err,users){
          
     var flag=true

     for(var i=0;i<grp.admins.length;i++){
          
           if(grp.admins[i]._id==req.params.uid){
                     flag=false
                     console.log("here all groups....")
                     console.log(items)
           	        var items=[]
           	        var a=[]
                   var b=[] 
	         for(var p=0;p<meuser.groups.length;p++){

	         	 a.push(String(meuser.groups[p]._id))
	         }
             for(var q=0;q<users.groups.length;q++){

             	 b.push(String(users.groups[q]._id))
             }
              console.log("here all id")
              console.log(a)
              console.log(b)
	          for(var i=0;i<a.length;i++){

	           group.findById(a[i],function(err,grps){
	          	  for(var j=0;j<b.length;j++){
	                  if(Number(a[i])==Number(b[j])){
                         console.log("matched")
	                  	   items.push(grps)
	                  	   break
	                  }
	         } 
	      })
	       }        
	                console.log(items)
           	        res.render("profile.ejs",{user:users,items:items,flag:false,group:grp._id})
           	        break

           }

     }
     if(flag==true){
          var items=[]
           	        var a=[]
                   var b=[] 
	         for(var p=0;p<meuser.groups.length;p++){

	         	 a.push(meuser.groups[p]._id)
	         }
             for(var q=0;q<users.groups.length;q++){

             	 b.push(users.groups[q]._id)
             }

	          for(var i=0;i<a.length;i++){

	           group.findById(a[i],function(err,grps){
	          	  for(var j=0;j<b.length;j++){
	                  if(b[j]==a[i]){
                         console.log("matched")
	                  	   items.push(grps)
	                  	   break
	                  }
	         } 
	      })
	       }   
     	     res.render("profile.ejs",{user:users,items:items,flag:true,group:grp._id})

     }
})
   	  })
   	  }
      else{
   user.findById(req.params.uid).populate("groups").exec(function(err,users){
      
      if(req.params.uid==req.user._id){
      	 res.render("profile.ejs",{user:users,flag:" ",items:[],group:" "})


        
 }
 else{
user.findOne({_id:req.params.id}).populate("groups").exec(function(err,alluser){

          var items=[]

           for(var i=0;i<alluser.groups.length;i++){
            group.findById(alluser.groups[i]._id,function(err,grpp){
           	  for(var j=0;j<users.groups.length;j++){
                 
                 if(users.groups[j]._id==grpp._id){

                     items.push(grpp)
                     break


                 }

           	  }
  
             })
           }

               	 res.render("profile.ejs",{user:users,flag:" ",items:items,group:" "})

      }) 
  
}
})
    }

})
})

app.post("/upDatebio",function(req,res){

	 

         user.findById(req.body.id,function(err,users){

         	 users.updateOne({bio:req.body.bios},function(err,info){

         	 })
         })	    
	  
   res.redirect("back")
})
app.post("/upDatename",function(req,res){

	 

         user.findById(req.body.id,function(err,users){

         	 users.updateOne({name:req.body.names},function(err,info){

         	 })
         })	    
	  
   res.redirect("back")
})

app.post("/groupName/:id",function(req,res){

	 

         group.findById(req.params.id,function(err,grp){

         	 grp.updateOne({name:req.body.names},function(err,info){

         	 })
         })	    
	  
   req.flash("success","Updated")
   res.redirect("back")
})



app.post("/deleteGroup",islogged,function(req,res){
var flag=true
user.findById(req.body.uid).populate("groups").exec(function(err,userss){
   

	  group.findById(req.body.gid).populate("users").populate("admins").exec(function(err,allg){

	  	 for(var i=0;i<allg.users.length;i++){

	  	 	  if(allg.users[i]._id==req.body.uid){
                  var flags=true   
	  	 	  	  for(var j=0;j<allg.admins.length;j++){
                         
                         if(allg.admins[j]._id==req.body.uid){

                         	  allg.admins.splice(j,1)
                         	  allg.users.splice(i,1)
	  	 	  	              allg.members.push(userss._id)
                
	  	 	  	              allg.save()
	  	 	  	              flags=false
	  	 	  	              break
                         }

	  	 	  	  }
	  	 	  	  if(flags==true){

	  	 	  	  	  allg.users.splice(i,1)
	  	 	  	              allg.members.push(userss._id)
                
	  	 	  	              allg.save()
	  	 	  	  }
	  	 	  	  
          	  	  break
	  	 	  
	  	 }
	  	 }

if(flag==true){

 for(var j=0;j<userss.groups.length;j++){

	  	 	  if(userss.groups[j]._id==req.body.gid){
	  	 	  	  userss.groups.splice(j,1)
                 if(userss.which==allg._id){
                           userss.which=" "

                     }
	  	 	  	  userss.save()
          	  break
	  	 	  
	  	 }
	  	 }
}
	                          
if(flag==true){
	     	 for(var j=0;j<allg.users.length;j++){

               user.findOne({_id:allg.users[j]._id},function(err,found){
                  
              console.log("here for noti matched")
              noti.create({uid:allg._id,name:" ",seen:"no",date:Date.now(),inc:1,gen:"grp",type:"remove",grName:allg.name,removed:userss.name},function(err,nots){
                    
                   found.notis.push(nots)
                   found.save()
                      
                    })

               })
          } 
	 
                   
}	   


   req.flash("success","You left the group" + allg.name)      	   
   res.redirect("/singleAdmin/"+allg._id)

})
})
}) 


app.post("/registered",function(req,res){
           
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


app.post("/groupchatCreate",islogged,function(req,res){
 
   user.findById(req.body.id).populate("chats").exec(function(err,userones){

   	 group.findOne({_id:req.body.uid}).populate("messages").populate("users").exec(function(err,totalGroup){
     

       

   	 	 message.create({text:req.body.text,from:req.body.id,to:req.body.uid,name:userones.name,date:Date.now()},function(err,texts){
          message.findById(texts._id,function(err,allm){
             var i=totalGroup.messages.length-1
             totalGroup.messages.push(0)
             while (i!==-1){
                 totalGroup.messages[i+1]=totalGroup.messages[i]
                 i=i-1

             }
             totalGroup.messages[i+1]=texts
             totalGroup.save()
              var items=[]
              var p=0
   	 	    for(var j=0;j<totalGroup.users.length;j++){


                      user.findOne({_id:totalGroup.users[j]._id},function(err,found){
                               
                             console.log("already one............................................................................................................................................")
                             if(found.image){

                             	 var image=found.image
                             }
                             else{

                             	var image=" "
                             }

                      	 	 seen.create({who:found.name,id:found._id,image:image,date:Date.now()},function(err,see){
                                              	   	 	    console.log("atlist here")

                                         	 if(found.which==totalGroup._id){ 
                                         	  texts.seens.push(see)
                                                                                                
                                           }
                                           else{

                                           	 seen.findByIdAndDelete(see._id,function(err,info){

                                           	 })
                                           }
                                            p=p+1
                                            if(p==totalGroup.users.length){

                                            	 texts.save()
                                            }
         })
                      	 
                        
                      	 
                   
   	 	    	 
                   })
                        
   	 	    	 

   	 	    }
   	 	    // console.log("here all array")
   	 	    // console.log(items)
          //   var p=0
   	 	    // for(var i=0;i<items.length;i++){
          //         console.log("here savings")
          //         console.log(items[i]) 
   	 	    // 	  texts.seens.push(items[i])
   	 	    //       p=p+1
   	 	    //       if(p==items.length){

   	 	    //       	  texts.save()
   	 	    //       }
   	 	    // }	 
   	 	  // var p=0
   	 	  // console.log("here all seens.........................")
        //       console.log(items)
        //   for(var x=0;x<items.length;x++){
             
        //       if(p==items.length-1){

        //       	   texts.save()
        //       }
        //       p=p+1
        //   }

   	 	 })
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

app.get("/messageSeen/:id",islogged,function(req,res){

  message.findById(req.params.id).populate("seens").exec(function(err,info){

     res.render("allseen.ejs",{messages:info})
   })
})

app.get("/Members/:id",islogged,function(req,res){
  
   if(req.query.searchu){
  group.findById(req.params.id).populate("users").populate("admins").exec(function(err,groups){

   	  var items=[]
   	  var search=req.query.searchu
   	  var searches=search.toLowerCase()
      for(var i=0;i<groups.users.length;i++){

      	  for(var j=0;j<groups.users[i].name.length;j++){

      	  	  var k=j
      	  	  var flag=true
      	  	  for(var x=0;x<searches.length;x++){

      	  	  	  if(searches[x]!==groups.users[i].name[k]){

      	  	  	  	  flag=false
      	  	  	  	  break
      	  	  	  }
      	  	  	  k=k+1
      	  	  }

      	  	  if(flag==true){

      	  	  	  items.push(groups.users[i])
      	  	  	  break
      	  	  }
      	  }
      }
      if(items.length>0){
    var admins=true
    for(var x=0;x<groups.admins.length;x++){

    	  if(groups.admins[x].username==req.user.username){

    	  	  admins=false
    	  	       res.render("Members.ejs",{groups:groups,items:items,data:req.query.searchu,admins:false})

    	  	  break
    	  }
    }
    if(admins==true){
     res.render("Members.ejs",{groups:groups,items:items,data:req.query.searchu,admins:true})
}
      }
      else{

      	               res.send("<h1 align=center style=padding-top:200px>No User Found</h1>")

      }
    })
    }
    else{
     group.findById(req.params.id).populate("users").populate("admins").exec(function(err,groups){

    var items=[]
    for(var i=0;i<groups.users.length;i++){
      
       items.push(groups.users[i])
    
    }
    if(groups.users.length){
 var admins=true
    for(var x=0;x<groups.admins.length;x++){

    	  if(groups.admins[x].username==req.user.username){

    	  	  admins=false
    	  	       res.render("Members.ejs",{groups:groups,items:items,data:" ",admins:false})

    	  	  break
    	  }
    }
     if(admins==true){
     res.render("Members.ejs",{groups:groups,items:items,data:" ",admins:true})
     }
    }
    else{
    	      	               res.send("<h1 align=center style=padding-top:200px>No User Found</h1>")

    }    
    
   })
   }   
  
})


app.get("/adminMembers/:id",islogged,function(req,res){
  
   if(req.query.searchu){
  group.findById(req.params.id).populate("admins").exec(function(err,groups){

   	  var items=[]
   	  var search=req.query.searchu
   	  var searches=search.toLowerCase()
      for(var i=0;i<groups.admins.length;i++){

      	  for(var j=0;j<groups.admins[i].name.length;j++){

      	  	  var k=j
      	  	  var flag=true
      	  	  for(var x=0;x<searches.length;x++){
                 if(groups.admins[i].name[k]){
                 	 var char=groups.admins[i].name[k].toLowerCase()
                 }
      	  	  	  if(searches[x]!==char){

      	  	  	  	  flag=false
      	  	  	  	  break
      	  	  	  }
      	  	  	  k=k+1
      	  	  }

      	  	  if(flag==true){

      	  	  	  items.push(groups.admins[i])
      	  	  	  break
      	  	  }
      	  }
      }
      if(items.length>0){
      	 var admins=true
    for(var x=0;x<groups.admins.length;x++){

    	  if(groups.admins[x].username==req.user.username){

    	  	  admins=false
     res.render("allAdmins.ejs",{groups:groups,items:items,data:req.query.searchu,admins:false})

    	  	  break
    	  }
    }
    if(admins==true){

     res.render("allAdmins.ejs",{groups:groups,items:items,data:req.query.searchu,admins:true})

    }


      }
      else{

      	               res.send("<h1 align=center style=padding-top:200px>No Members Found</h1>")

      }
    })
    }
    else{
     group.findById(req.params.id).populate("admins").exec(function(err,groups){

    var items=[]
    for(var i=0;i<groups.admins.length;i++){
      
       items.push(groups.admins[i])
    
    }
    if(groups.admins.length>0){
       var admins=true
    for(var x=0;x<groups.admins.length;x++){

    	  if(groups.admins[x].username==req.user.username){

    	  	  admins=false
      res.render("allAdmins.ejs",{groups:groups,items:items,data:" ",admins:false})

    	  	  break
    	  }
    }
    if(admins==true){

      res.render("allAdmins.ejs",{groups:groups,items:items,data:" ",admins:true})

    }


    }
    else{
    	      	               res.send("<h1 align=center style=padding-top:200px>No User Found</h1>")

    }    
    
   })
   }   
  
})

app.get("/allMembers/:id",islogged,function(req,res){
 
  group.findById(req.params.id).populate("users").populate("members").exec(function(err,groups){

  if(req.query.searcher){
   var items=[]
   var searches=req.query.searcher 
   var search=searches.toLowerCase()
   for(var i=0;i<groups.members.length;i++){
     for(var j=0;j<groups.members[i].name.length;j++){

     	  var k=j
     	  var flag=true
     	  
     	  for(var x=0;x<search.length;x++){
             if(groups.members[i].name[k]){
     	  	    var char=groups.members[i].name[k].toLowerCase()
     	     }
     	  	  if(search[x]!==char){

     	  	  	 flag=false
     	  	  	 break
     	  	  }
     	  	  k=k+1
     	  }
        if(flag==true){

        	 items.push(groups.members[i])
        	 break
        }
     }  
   }
   if(items.length>0){
    console.log(items)
    res.render("allMember.ejs",{gid:req.params.id,ses:req.session.people,groups:" ",items:items,data:req.query.searcher})
}
else{
  
                            	         res.send("<h1 align=center style=padding-top:200px>No User Found</h1>")


}
  
  }
  else{
  group.findById(req.params.id).populate("users").populate("members").exec(function(err,groups){
   if(groups.members.length>0){
    var items=[]
    for(var i=0;i<groups.members.length;i++){

    	  items.push(groups.members[i])
    }
    
    res.render("allMember.ejs",{gid:req.params.id,ses:req.session.people,groups:groups,items:items,data:" "})
   
   }
   else{

   	                             	         res.send("<h1 align=center style=padding-top:200px>No User Found</h1>")

   }
   })

   }
   })
})

app.get("/groupChat/:uid/:id",islogged,function(req,res){
   

 user.findById(req.user._id).populate("notis").exec(function(err,users){   
    for(var j=0;j<users.notis.length;j++){

	if(users.notis[j].uid==req.params.uid){

		 noti.findByIdAndDelete(users.notis[j]._id,function(err,info){
		 	
		 })
	}
}


 group.findById(req.params.uid).populate("messages").populate("users").populate("admins").exec(function(err,groupr){   
if(err){

	 console.log(err)

}
else{
   var mark=true

 for(var x=0;x<groupr.users.length;x++){

 	  if(groupr.users[x].username==req.user.username){

 	  	  mark=false
 	  	  var admins=true
    for(var x=0;x<groupr.admins.length;x++){

    	  if(groupr.admins[x].username==req.user.username){

    	  	  admins=false
    	  	  	  	     res.render("groupChat.ejs",{uid:req.params.uid,id:req.params.id,users:users,groups:groupr,found:" ",mark:false,marks:false,admins:false})

    	  	  break
    	  }
    }
    if(admins==true){

    	     	  	  	  	     res.render("groupChat.ejs",{uid:req.params.uid,id:req.params.id,users:users,groups:groupr,found:" ",mark:false,marks:false,admins:true})

    }

 	  	  break
 	  }
 }
if(mark==true){
var admins=true
    for(var x=0;x<groupr.admins.length;x++){

    	  if(groupr.admins[x]._id==req.user._id){

    	  	  admins=false
    	  	 	    res.render("groupChat.ejs",{uid:req.params.uid,id:req.params.id,users:users,groups:groupr,found:" ",mark:true,marks:true,admins:false})

    	  	  break
    	  }
    }
    if(admins==true){

    	 	    res.render("groupChat.ejs",{uid:req.params.uid,id:req.params.id,users:users,groups:groupr,found:" ",mark:true,marks:true,admins:true})

    }

}
 // var flag=true
 // users.chats.forEach(function(data){

 // 	  if(data.from==users._id && data.to==victim._id || data.to==users._id && data.from==victim._id)
 //     {
 //        flag=false\\
 //     	return
 //     }
 // })
 // if (flag==true){
 //      var mark="yes"
 // }
 // else{

 // 	 var mark="no"
 // }

}
})
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
 //        flag=false\\
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

