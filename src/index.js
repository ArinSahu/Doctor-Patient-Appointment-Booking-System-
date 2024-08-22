const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const {users,doctors,symtoms} = require("./config")
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
            res.render("home",{patient:check});
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

app.post("/addTimeSlot", async (req, res) => {
    
    try {
        const doctor = await doctors.findOne({ reg_id: req.body.doctorId });
        if (!doctor) {
            res.send("Doctor not found");
            return;
        }
        const newTimeSlot = {
            date: req.body.date,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            avgTime: req.body.avgTime,
            booked: generateBookedSlots(req.body.startTime, req.body.endTime, req.body.avgTime)
        };
        doctor.timeSlots.push(newTimeSlot);
        await doctor.save();
        res.send("Time slot added successfully");
    } catch (error) {
        res.send("Error adding time slot");
    }
    function generateBookedSlots(startTime, endTime, avgTime) {
        const slots = [];
        
       
        const start = convertToMinutes(startTime);
        const end = convertToMinutes(endTime);
        const avg = parseInt(avgTime);
    
       
        for (let time = start; time < end; time += avg) {
            slots.push('');  
        }
    
        return slots;
    }
    
   
    function convertToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
});


app.post("/showDoctors",async(req,res)=>{
    const patient= req.body.patient;
    const symptom = req.body.symtom;
    const specialityData = await symtoms.findOne({ symtoms: symptom });
        if (!specialityData) {
            res.status(404).send("No speciality found for this symptom");
            return;
        }
        const doctorsList = await doctors.find({ speciality: specialityData.dept });
        if (doctorsList.length === 0) {
            res.status(404).send("No doctors found for this speciality");
            return;
        }
        res.render("doctorsList", { doctors: doctorsList,patient });
        // console.log(patient);
});

app.get("/bookAppointmenst", async (req, res) => {
    const doctorId = req.query.doctorId;
    const patient=req.query.patient;
    // console.log(patient);
    try {
        const doctor = await doctors.findById(doctorId);
        if (!doctor) {
            res.status(404).send("Doctor not found");
            return;
        }

        res.render("bookAppointment", { doctor,patient });
    } catch (error) {
        res.status(500).send("Error loading appointment page");
    }
});

app.post("/getDate", async (req, res) => {
    const doctorId = req.body.doctorId;
    const dateIndex = req.body.date;
    const patient=req.body.patient;

    try {
        const doctor = await doctors.findById(doctorId);
        if (!doctor || !doctor.timeSlots[dateIndex]) {
            return res.status(404).send("Doctor or Time Slot not found");
        }

        res.render("availableSlots", { doctor, dateIndex ,patient});
        // console.log(dateIndex);
    } catch (error) {
        res.status(500).send("Error processing the date");
    }
});

app.post("/finalBookAppointment", async (req, res) => {
    const doctorId = req.body.doctorId;
    const dateIndex = req.body.dateIndex;
    const timeSlotIndex = req.body.timeSlot;
    const patient = req.body.patient;

    try {
       
        const doctor = await doctors.findById(doctorId);
        if (!doctor) {
            return res.status(404).send("Doctor not found");
        }
        if (doctor.timeSlots[dateIndex].booked[timeSlotIndex] !== '') {
            return res.status(400).send("This time slot is already booked");
        }
        doctor.timeSlots[dateIndex].booked[timeSlotIndex] = patient;
        await doctor.save();

        res.send(`Appointment successfully booked for ${patient} on ${doctor.timeSlots[dateIndex].date.toDateString()} at ${doctor.timeSlots[dateIndex].booked[timeSlotIndex]}`);
    } catch (error) {
        res.status(500).send("Error booking the appointment");
    }
});



app.listen(port, () => {
    console.log(`server running on port :${port}`);
})