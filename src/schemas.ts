import { Schema, model } from "mongoose";

//owner schema and model
interface Owner {
    name: String;
    email: String;
    phone_no: String;
    restaurant_name: String;
    tables: Number;
    password: String;
}
const OwnerSchema = new Schema<Owner>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone_no: { type: String, required: true},
    restaurant_name: { type: String, required: true},
    tables: { type: Number, required: true},
    password: {type: String, required: true}
});
export const owner = model<Owner>('owner', OwnerSchema);

//category schema and model
interface Category {
    owner_id: String;
    category_name: String;
}
const CategorySchema = new Schema<Category>({
    owner_id: { type: String, required: true},
    category_name: { type: String, required: true}
});
export const categories = model<Category>('categories', CategorySchema);

//dishes schema and model
interface Dishes {
    category_id: String;
    owner_id: String;
    dish_name: String;
    is_veg: Boolean;
}
const DishSchema = new Schema<Dishes>({
    category_id: { type: String, required: true},
    owner_id: {type: String, required: true},
    dish_name: {type: String, required: true},
    is_veg: { type: Boolean, required: true}
});
export const dishes = model<Dishes>('dishes', DishSchema);

//dishPrice schema and model
interface Dish_Price {
    dish_id: String;
    quantity_type: String;
    price: Number;
}
const DishPriceSchema = new Schema<Dish_Price>({
    dish_id: { type: String, required: true},
    quantity_type: {type: String, required: true},
    price: {type: Number, required: true}
});
export const dish_price = model<Dish_Price>('DishPrice', DishPriceSchema);

//orders schema and model
interface Orders {
    owner_id: String;
    dish_id: String;
    quantity_type: String;
    price: Number;
    table_no: Number;
}
const OrdersSchema = new Schema<Orders>({
    owner_id: { type: String, required: true},
    dish_id: {type: String, required: true},
    quantity_type: {type:String, required: true},
    price: {type:Number, required: true},
    table_no: {type:Number, required: true}
});
export const orders = model<Orders>('orders', OrdersSchema);

//transaction schema and model
interface Transaction {
    owner_id: String;
    total_price: Number;
    table_no: Number;
    date: String;
}
const TransactionSchema = new Schema<Transaction>({
    owner_id: { type: String, required: true},
    total_price: {type: Number, required: true},
    table_no: {type:Number, required: true},
    date: {type:String, required: true},
});
export const transactions = model<Transaction>('transactions', TransactionSchema);