const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb+srv://arinsahu0:kdfiKtWNmv35Xyac@cluster0.behds7e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

// connect.then(()=>{
//     console.log("ho gaya db connect");
// })
// .catch(()=>{
//     console.log("nai hua db connect");
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
    }
});

const timeslotSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctors',
        required: true
    },
    date: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    }
});



const users= new mongoose.model("users",loginSchema);
const doctors = mongoose.model("doctors", doctorloginSchema);
const timeslotCollection = new mongoose.model("timeslots", timeslotSchema);
module.exports = { users, doctors ,timeslotCollection};
