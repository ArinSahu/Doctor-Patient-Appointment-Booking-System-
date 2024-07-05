const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/Login-tut");

// connect.then(()=>{
//     console.log("ho gaya db connect");
// })
// .catch(()=>{
//     console.log("nai hua db connect madarchod");
// })

const loginSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
});

const symtomSchema=new mongoose.Schema({
    dept:{
        type:String
    },
    symtoms:{
        type:String
    }
})

const doctorloginSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        requred:true

    },
    phone_no:{
        type:Number,
        required:true,
        unique:true
    },
    reg_id:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    speciality: {
        type: String,
        required: true
    },
    timeSlots: [{
        doctorId:{
            type:Number,
            required:true
        },
        date:{
            type:Date
        },
        startTime:{
            type:String
        },
        endTime:{
            type:String
        }        
    }]
});





const users= new mongoose.model("users",loginSchema);
const doctors = mongoose.model("doctors", doctorloginSchema);
const symtoms = mongoose.model("symtoms", symtomSchema);

module.exports = { users, doctors,symtoms};
