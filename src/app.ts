import express from "express";
const bodyparser = require('body-parser');
import { connect } from "mongoose";
const mongoose = require('mongoose');
import { response } from "./result";
const bcrypt = require('bcryptjs');
import {owner,categories,dishes,dish_price,orders,transactions} from "./schemas";

const app = express();
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
const port = 8000 || process.env.PORT;
// const dburl = 'mongodb://localhost:27017/Ts';
const dburl = 'mongodb+srv://tushar:tushar52002@tmo-db.4c9nu.mongodb.net/TMO-DB?retryWrites=true&w=majority';

//database connection
connect(dburl)
.then(()=>{
    console.log("Connected To DataBase: TMO");
  })
.catch(err => {
    console.log("Can't connect to database!");
    // console.log(err);
})

//server successfull message
app.get('/',async(req,res)=>{
    res.send(response(true,`server is running on port ${port}`));
});

//get owners
app.get('/owners',async(req,res)=>{
    const result:any = await owner.find({});
    res.send(response(true,"owners get successfully",result));
});
//add user
app.post('/register',async(req,res)=>{
    if(req.body.name == "" ||
     req.body.phone_no == "" ||
     req.body.email == "" ||
     req.body.restaurant_name == "" ||
     req.body.tables == (null||undefined||"") ||
     req.body.password == ""){
      res.send(response(false,"please fill all fields"));
      return;
    }
    //encrypting password
    const hashedPassword:String = await bcrypt.hash(req.body.password,12)
    req.body.password = hashedPassword;
    
    //inserting into db
    await owner.create(req.body,(error:any, data:any)=> {
    if(error){
        res.send(response(false,"can't save user.. Please try again later!"));
        return;
    }
    data = JSON.parse(JSON.stringify(data));
    delete data.password;
    res.send(response(true,`Registered successfully`,data));
    });
});

//login
app.post('/login',async(req,res)=>{
    
    let data:Object = await owner.find({email:req.body.email});
    if(data[0] == undefined){
        res.send(response(false,"user does not exist!"));
        return;
    }
    const result = await bcrypt.compare(req.body.password,data[0].password);
    if(!result){
        res.send(response(false,`password does not match for email : ${req.body.email}`));
        return;
    }
    data = JSON.parse(JSON.stringify(data));
    delete data[0].password;
    res.send(response(true,"Logged In successfully",data[0]));
});

//add dish
app.post('/dish',async(req,res)=>{

    const data = await dishes.insertMany(req.body);

    // making array of objects for quanity price
    let arrObj = [];
    let num = 0;
    for(let i = 0 ; i < req.body.length ; i++){
        for(let j = 0 ; j < req.body[i].quantity_price.length ; j++){
            req.body[i].quantity_price[j].dish_id = data[i].id;
            arrObj[num] = req.body[i].quantity_price[j];
            num++;
        }
    }

    //saving price
    const wait = await dish_price.insertMany(arrObj);
    res.send(response(true,"all dishes has baan saved successfullly"));
});

//get dishes
app.get('/dish',async (req,res)=>{

    if(req.query.owner_id == undefined || req.query.owner_id == ""){
        res.send(response(false,"invalid ownerID"));
        return;
    }
    //getting items and price
    var dish = await dishes.find(req.query,{id:1,dish_name:1,category_id:1,owner_id:1,is_veg:1})
    var price = await dish_price.find({});
    var result = JSON.parse(JSON.stringify(dish));

    // adding price in dishes
    for(let i = 0 ; i < dish.length ; i++){
        let arr = [];
        let num = 0;
        for(let j = 0 ; j < price.length ; j++){
            if(dish[i].id == price[j].dish_id){
                arr[num] = price[j];
                num++;
            }
        }
        result[i].quantity_price = arr;
    }
    //sending response
    res.send(response(true,"dishes get successfully",result));
});

//add category
app.post('/category',async(req,res)=>{
    categories.create(req.body,(error:any, docs:any)=>{
        if(error){
          res.send(response(false,"Can't save category, Please try again"));
          return;
        }
        //sending response
        res.send(response(true,"category saved successfully!"));
    });
});

//get category
app.get('/category',async(req,res)=>{

    if(req.query.owner_id=="" || req.query.owner_id==undefined){
        res.send(response(false,"Invalid OwnerID"));
    }
    const data = await categories.find(req.query);
    res.send(response(true,"categories get successfully",data));
});

//add order
app.post('/order',async(req,res)=>{

    orders.insertMany(req.body)
    .catch(err=>{
        res.send(response(false,"can't add order, Please try again later"));
    })
    .then(()=>{
        res.send(response(true,"Order added successfully"));
    })
});

//ge order
app.get('/order',async(req,res)=>{

    if(req.query.owner_id == undefined || req.query.owner_id == ""){
        res.send(response(false,"invalid ownerID"));
        return;
      }
    
      const order:any = await orders.find(req.query).lean();
    
      if(JSON.stringify(order) == "[]"){
        res.send(response(false,"This table have no orders"));
        return;
      }
      for(let i = 0 ; i < order.length ; i++){
        const dish = await dishes.find({_id:order[i].dish_id});
        let qp = {"type":order[i].quantity_type , "price":order[i].price};
        order[i].name = dish[0].dish_name;
        order[i].quantity_price = qp;
        delete order[i].dish_id;
        delete order[i].quantity_type;
        delete order[i].price;
      }
      res.send(response(true,"order get successfully",order));
});

//delete order
app.delete('/order',async(req,res)=>{

    if(req.body.owner_id == undefined || req.body.owner_id == ""){
        res.send(response(false,"invalid ownerID"));
        return;
    }
    if(mongoose.Types.ObjectId.isValid(req.body.id)){
        const del = await orders.deleteMany({_id:req.body.id,owner_id:req.body.owner_id});
        if(del.deletedCount == 0){
          res.send(response(false,"no order with this id exist!"));
          return;
        }
        else{
          res.send(response(true,"order deleted successfully"));
          return;
        }
    }
    res.send(response(false,"invalid id"));
});

//order finish
app.post('/orderFinish',async(req,res)=>{

    if(req.body.owner_id == undefined || req.body.owner_id == ""){
        res.send(response(false,"invalid ownerID"));
        return;
    }
    
    //getting price from table
    const price = await orders.find(req.body,{id:1,price:1});
    if(JSON.stringify(price)=="[]"){
        res.send(response(false,"no order exist on this table"));
        return;
    }
    
    //getting toal price
    let totalPrice:any = 0;
    for(var i = 0 ; i < price.length ; i++){
        totalPrice += price[i].price;
    }
      
    //getting current date
    var datetime:Date|String = new Date();
    datetime = datetime.toISOString().slice(0,10);
    
    // inserting in transactions
    var insertobj = [{"owner_id":req.body.owner_id, "table_no":req.body.table_no, "total_price":totalPrice ,"date":datetime}];
    transactions.insertMany(insertobj)
    .catch(err=>{
        res.send(response(false,"Can't add transaction, Please try again"));
        return;
    });
    
    //deleting order
    const del = await orders.deleteMany({table_no:req.body.table_no,owner_id:req.body.owner_id});
    // console.log(del);
    res.send(response(true,"order finished successfully"));
});

//get transactions
app.get('/transaction',async(req,res)=>{

    if(req.query.owner_id == "" || req.query.owner_id == undefined){
        res.send(response(false,"Invalid OwnerID"));
    }
    const data = await transactions.find(req.query);
    res.send(response(true,"transaction get succesfully",data));
});

//wrong route
app.all('*',(req,res)=>{
    res.send(response(false,'This is wrong route'));
});

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`);
});