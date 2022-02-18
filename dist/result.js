"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.response = void 0;
class Result {
}
const response = (Success, Message, Data) => {
    let res = new Result();
    res.success = Success;
    res.message = Message;
    res.data = Data;
    return res;
};
exports.response = response;
//# sourceMappingURL=result.js.map