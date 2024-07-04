const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const {users,doctors} = require("./config")
const port = 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.use(express.static("public"));



app.get("/", (req, res) => {
    res.render("select");
});
app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});
app.get("/doctorLogin", (req, res) => {
    res.render("doctorLogin");
});

app.get("/doctorSignup", (req, res) => {
    res.render("doctorSignup");
});


app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    }
    const existingUser = await users.findOne({ name: data.name });
    if (existingUser) {
        res.render("signup",{message:"User already exists"});
    }
    else {
        const saltrounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltrounds);
        data.password = hashedPassword;
        const userData = await users.insertMany(data);
        //console.log(userData);
        res.render("login");
    }
});

app.post("/login", async (req, res) => {
    try {
        const check = await users.findOne({ name: req.body.username });
        if (!check) {
            res.render("login",{message:"User not found"});
        }
        else{
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
       // console.log(isPasswordMatch);
        if (isPasswordMatch) {
            res.render("home");
        }
        else {
            res.render("login", { message: "Wrong password" });
        }
    }
    } catch {
        res.send("Wrong details");
    }
});


app.post("/doctorSignup", async (req, res) => {
    const data = {
        name: req.body.username,
        email:req.body.email,
        phone_no:req.body.phonenumber,
        reg_id:req.body.regid,
        password: req.body.password,
        speciality:req.body.speciality

    }
    const existingUser = await doctors.findOne({ name: data.name });
    const existingId = await doctors.findOne({ reg_id: data.reg_id });
    if (existingUser) {
        res.render("doctorSignup",{message:"User already exists"});
    }
    if (existingId) {
        res.render("doctorSignup",{message:"User already exists"});
    }

    else {
        const saltrounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltrounds);
        data.password = hashedPassword;
        const userData = await doctors.insertMany(data);
        //console.log(userData);
        res.render("doctorLogin");
    }
});
app.post("/doctorLogin", async (req, res) => {
    try {
        const doctor = await doctors.findOne({ name: req.body.username });
        if (!doctor) {
            res.render("doctorLogin",{message:"User not found"});
        }
        else{
        const isPasswordMatch = await bcrypt.compare(req.body.password, doctor.password);
       // console.log(isPasswordMatch);
        if (isPasswordMatch) {
            res.render("doctorHome",{doctor});
        }
        else {
            res.render("doctorLogin", { message: "Wrong password" });
        }
    }
    } catch {
        res.send("Wrong details");
    }
});
app.post("/doctorHome",async(req,res)=>{

})
app.post("/home",async(req,res)=>{
    const data={
        symtom:req.body.symtom
    }

} )


app.listen(port, () => {
    console.log(`server running on port :${port}`);
})