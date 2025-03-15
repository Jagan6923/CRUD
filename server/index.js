const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const moment = require("moment");

const EventModel = require("./models/event");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3001',
        'https://yourdomain.com',
        "https://crud-blue-iota.vercel.app",
        "https://crud-v2uf.vercel.app/",
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization'
    ]
}));

mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });



app.get("/", async (req, res) => {
    try {
        console.log("Received request to fetch events");
        const events = await EventModel.find();
        console.log("Raw events from database:", events);

        const formattedEvents = events.map(event => ({
            ...event._doc,
            image: event.image
                ? `${req.protocol}://${req.get('host')}/uploads/${event.image.split('/').pop()}`
                : null,
            eventdate: moment(event.eventdate).format("DD-MM-YYYY")
        }));

        console.log("Formatted events:", formattedEvents);
        res.json(formattedEvents);
    } catch (err) {
        console.error("Full error in fetching events:", err);
        res.status(500).json({
            error: "Error fetching events",
            details: err.message
        });
    }
});


app.get("/getEvent/:id", async (req, res) => {
    try {
        const event = await EventModel.findById(req.params.id);
        if (!event) return res.status(404).json({ error: "Event not found" });
        res.json({
            ...event._doc,
            eventdate: moment(event.eventdate).format("DD-MM-YYYY")
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching event" });
    }
});
app.post("/createEvent", upload.single("image"), async (req, res) => {
    try {
        console.log("Request body:", req.body);
        console.log("Uploaded file:", req.file);

        const { eventname, eventplace, eventdate } = req.body;

        if (!eventname || !eventplace || !eventdate) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const parsedDate = new Date(eventdate);
        if (isNaN(parsedDate)) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        const image = req.file ? `/uploads/${req.file.filename}` : null;

        const newEvent = new EventModel({
            eventname,
            eventplace,
            eventdate: parsedDate,
            image
        });

        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        console.error("Error creating event:", err);
        res.status(500).json({
            error: "Error creating event",
            details: err.message
        });
    }
});

app.put("/updateEvent/:id", upload.single("image"), async (req, res) => {
    try {
        const { eventname, eventplace, eventdate } = req.body;

        if (!eventname || !eventplace || !eventdate) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const parsedDate = new Date(eventdate);
        if (isNaN(parsedDate)) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        const updateData = {
            eventname,
            eventplace,
            eventdate: parsedDate
        };

        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        console.log("Updating event with ID:", req.params.id);
        console.log("Update data:", updateData);

        const updatedEvent = await EventModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedEvent) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json(updatedEvent);
    } catch (err) {
        console.error("Error updating event:", err);
        res.status(500).json({
            error: "Error updating event",
            details: err.message
        });
    }
});
app.delete("/deleteEvent/:id", async (req, res) => {
    try {
        const event = await EventModel.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ error: "Event not found" });
        res.json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting event" });
    }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

