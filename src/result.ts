class Result {
    public success : Boolean;
    public message : String;
    public data : Object;
}

export const response=(Success:Boolean,Message:String,Data?:Object)=>{
    let res = new Result();
    res.success = Success;
    res.message = Message;
    res.data = Data;
    return res;
}