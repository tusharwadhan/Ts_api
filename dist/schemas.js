"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactions = exports.orders = exports.dish_price = exports.dishes = exports.categories = exports.owner = void 0;
const mongoose_1 = require("mongoose");
const OwnerSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone_no: { type: String, required: true },
    restaurant_name: { type: String, required: true },
    tables: { type: Number, required: true },
    password: { type: String, required: true }
});
exports.owner = (0, mongoose_1.model)('owner', OwnerSchema);
const CategorySchema = new mongoose_1.Schema({
    owner_id: { type: String, required: true },
    category_name: { type: String, required: true }
});
exports.categories = (0, mongoose_1.model)('categories', CategorySchema);
const DishSchema = new mongoose_1.Schema({
    category_id: { type: String, required: true },
    owner_id: { type: String, required: true },
    dish_name: { type: String, required: true },
    is_veg: { type: Boolean, required: true }
});
exports.dishes = (0, mongoose_1.model)('dishes', DishSchema);
const DishPriceSchema = new mongoose_1.Schema({
    dish_id: { type: String, required: true },
    quantity_type: { type: String, required: true },
    price: { type: Number, required: true }
});
exports.dish_price = (0, mongoose_1.model)('DishPrice', DishPriceSchema);
const OrdersSchema = new mongoose_1.Schema({
    owner_id: { type: String, required: true },
    dish_id: { type: String, required: true },
    quantity_type: { type: String, required: true },
    price: { type: Number, required: true },
    table_no: { type: Number, required: true }
});
exports.orders = (0, mongoose_1.model)('orders', OrdersSchema);
const TransactionSchema = new mongoose_1.Schema({
    owner_id: { type: String, required: true },
    total_price: { type: Number, required: true },
    table_no: { type: Number, required: true },
    date: { type: String, required: true },
});
exports.transactions = (0, mongoose_1.model)('transactions', TransactionSchema);
//# sourceMappingURL=schemas.js.map