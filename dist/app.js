"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bodyparser = require('body-parser');
const mongoose_1 = require("mongoose");
const mongoose = require('mongoose');
const result_1 = require("./result");
const bcrypt = require('bcryptjs');
const schemas_1 = require("./schemas");
const app = (0, express_1.default)();
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
const port = 8000 || process.env.PORT;
// const dburl = 'mongodb://localhost:27017/Ts';
const dburl = 'mongodb+srv://tushar:tushar52002@tmo-db.4c9nu.mongodb.net/TMO-DB?retryWrites=true&w=majority';
//database connection
(0, mongoose_1.connect)(dburl)
    .then(() => {
    console.log("Connected To DataBase: TMO");
})
    .catch(err => {
    console.log("Can't connect to database!");
    // console.log(err);
});
//server successfull message
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send((0, result_1.response)(true, `server is running on port ${port}`));
}));
//get owners
app.get('/owners', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield schemas_1.owner.find({});
    res.send((0, result_1.response)(true, "owners get successfully", result));
}));
//add user
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.name == "" ||
        req.body.phone_no == "" ||
        req.body.email == "" ||
        req.body.restaurant_name == "" ||
        req.body.tables == (null || undefined || "") ||
        req.body.password == "") {
        res.send((0, result_1.response)(false, "please fill all fields"));
        return;
    }
    //encrypting password
    const hashedPassword = yield bcrypt.hash(req.body.password, 12);
    req.body.password = hashedPassword;
    //inserting into db
    yield schemas_1.owner.create(req.body, (error, data) => {
        if (error) {
            res.send((0, result_1.response)(false, "can't save user.. Please try again later!"));
            return;
        }
        data = JSON.parse(JSON.stringify(data));
        delete data.password;
        res.send((0, result_1.response)(true, `Registered successfully`, data));
    });
}));
//login
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield schemas_1.owner.find({ email: req.body.email });
    if (data[0] == undefined) {
        res.send((0, result_1.response)(false, "user does not exist!"));
        return;
    }
    const result = yield bcrypt.compare(req.body.password, data[0].password);
    if (!result) {
        res.send((0, result_1.response)(false, `password does not match for email : ${req.body.email}`));
        return;
    }
    data = JSON.parse(JSON.stringify(data));
    delete data[0].password;
    res.send((0, result_1.response)(true, "Logged In successfully", data[0]));
}));
//add dish
app.post('/dish', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield schemas_1.dishes.insertMany(req.body);
    // making array of objects for quanity price
    let arrObj = [];
    let num = 0;
    for (let i = 0; i < req.body.length; i++) {
        for (let j = 0; j < req.body[i].quantity_price.length; j++) {
            req.body[i].quantity_price[j].dish_id = data[i].id;
            arrObj[num] = req.body[i].quantity_price[j];
            num++;
        }
    }
    //saving price
    const wait = yield schemas_1.dish_price.insertMany(arrObj);
    res.send((0, result_1.response)(true, "all dishes has baan saved successfullly"));
}));
//get dishes
app.get('/dish', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.query.owner_id == undefined || req.query.owner_id == "") {
        res.send((0, result_1.response)(false, "invalid ownerID"));
        return;
    }
    //getting items and price
    var dish = yield schemas_1.dishes.find(req.query, { id: 1, dish_name: 1, category_id: 1, owner_id: 1, is_veg: 1 });
    var price = yield schemas_1.dish_price.find({});
    var result = JSON.parse(JSON.stringify(dish));
    // adding price in dishes
    for (let i = 0; i < dish.length; i++) {
        let arr = [];
        let num = 0;
        for (let j = 0; j < price.length; j++) {
            if (dish[i].id == price[j].dish_id) {
                arr[num] = price[j];
                num++;
            }
        }
        result[i].quantity_price = arr;
    }
    //sending response
    res.send((0, result_1.response)(true, "dishes get successfully", result));
}));
//add category
app.post('/category', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    schemas_1.categories.create(req.body, (error, docs) => {
        if (error) {
            res.send((0, result_1.response)(false, "Can't save category, Please try again"));
            return;
        }
        //sending response
        res.send((0, result_1.response)(true, "category saved successfully!"));
    });
}));
//get category
app.get('/category', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.query.owner_id == "" || req.query.owner_id == undefined) {
        res.send((0, result_1.response)(false, "Invalid OwnerID"));
    }
    const data = yield schemas_1.categories.find(req.query);
    res.send((0, result_1.response)(true, "categories get successfully", data));
}));
//add order
app.post('/order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    schemas_1.orders.insertMany(req.body)
        .catch(err => {
        res.send((0, result_1.response)(false, "can't add order, Please try again later"));
    })
        .then(() => {
        res.send((0, result_1.response)(true, "Order added successfully"));
    });
}));
//ge order
app.get('/order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.query.owner_id == undefined || req.query.owner_id == "") {
        res.send((0, result_1.response)(false, "invalid ownerID"));
        return;
    }
    const order = yield schemas_1.orders.find(req.query).lean();
    if (JSON.stringify(order) == "[]") {
        res.send((0, result_1.response)(false, "This table have no orders"));
        return;
    }
    for (let i = 0; i < order.length; i++) {
        const dish = yield schemas_1.dishes.find({ _id: order[i].dish_id });
        let qp = { "type": order[i].quantity_type, "price": order[i].price };
        order[i].name = dish[0].dish_name;
        order[i].quantity_price = qp;
        delete order[i].dish_id;
        delete order[i].quantity_type;
        delete order[i].price;
    }
    res.send((0, result_1.response)(true, "order get successfully", order));
}));
//delete order
app.delete('/order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.owner_id == undefined || req.body.owner_id == "") {
        res.send((0, result_1.response)(false, "invalid ownerID"));
        return;
    }
    if (mongoose.Types.ObjectId.isValid(req.body.id)) {
        const del = yield schemas_1.orders.deleteMany({ _id: req.body.id, owner_id: req.body.owner_id });
        if (del.deletedCount == 0) {
            res.send((0, result_1.response)(false, "no order with this id exist!"));
            return;
        }
        else {
            res.send((0, result_1.response)(true, "order deleted successfully"));
            return;
        }
    }
    res.send((0, result_1.response)(false, "invalid id"));
}));
//order finish
app.post('/orderFinish', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.owner_id == undefined || req.body.owner_id == "") {
        res.send((0, result_1.response)(false, "invalid ownerID"));
        return;
    }
    //getting price from table
    const price = yield schemas_1.orders.find(req.body, { id: 1, price: 1 });
    if (JSON.stringify(price) == "[]") {
        res.send((0, result_1.response)(false, "no order exist on this table"));
        return;
    }
    //getting toal price
    let totalPrice = 0;
    for (var i = 0; i < price.length; i++) {
        totalPrice += price[i].price;
    }
    //getting current date
    var datetime = new Date();
    datetime = datetime.toISOString().slice(0, 10);
    // inserting in transactions
    var insertobj = [{ "owner_id": req.body.owner_id, "table_no": req.body.table_no, "total_price": totalPrice, "date": datetime }];
    schemas_1.transactions.insertMany(insertobj)
        .catch(err => {
        res.send((0, result_1.response)(false, "Can't add transaction, Please try again"));
        return;
    });
    //deleting order
    const del = yield schemas_1.orders.deleteMany({ table_no: req.body.table_no, owner_id: req.body.owner_id });
    // console.log(del);
    res.send((0, result_1.response)(true, "order finished successfully"));
}));
//get transactions
app.get('/transaction', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.query.owner_id == "" || req.query.owner_id == undefined) {
        res.send((0, result_1.response)(false, "Invalid OwnerID"));
    }
    const data = yield schemas_1.transactions.find(req.query);
    res.send((0, result_1.response)(true, "transaction get succesfully", data));
}));
//wrong route
app.all('*', (req, res) => {
    res.send((0, result_1.response)(false, 'This is wrong route'));
});
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
//# sourceMappingURL=app.js.map