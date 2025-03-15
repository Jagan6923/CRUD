const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();
const moment = require("moment");

const EventModel = require("./models/event");

const app = express();
app.use(cors());
app.use(express.json());

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:3001",
            "https://yourdomain.com",
            "https://crud-blue-iota.vercel.app",
            "https://crud-v2uf.vercel.app/",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "events",
        format: async (req, file) => "png", // Change format if needed
        public_id: (req, file) => Date.now() + "-" + file.originalname,
    },
});

const upload = multer({ storage });

mongoose
    .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", async (req, res) => {
    try {
        console.log("Fetching events...");
        const events = await EventModel.find();
        res.json(
            events.map((event) => ({
                ...event._doc,
                eventdate: moment(event.eventdate).format("DD-MM-YYYY"),
            }))
        );
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({ error: "Error fetching events" });
    }
});

// Get a single event
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

        const image = req.file ? req.file.path : null;

        const newEvent = new EventModel({
            eventname,
            eventplace,
            eventdate: parsedDate,
            image,
        });

        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        console.error("Error creating event:", err);
        res.status(500).json({ error: "Error creating event" });
    }
});

app.put("/updateEvent/:id", upload.single("image"), express.json(), async (req, res) => {
    try {
        const { eventname, eventplace, eventdate } = req.body;

        // Validate input data
        if (!eventname || !eventplace || !eventdate) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Ensure date is properly parsed
        const parsedDate = new Date(eventdate);
        if (isNaN(parsedDate)) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        // Prepare update data
        const updateData = {
            eventname,
            eventplace,
            eventdate: parsedDate
        };

        // Only update image if a new file is uploaded
        if (req.file) {
            updateData.image = req.file.path;
        }

        console.log("Updating event with ID:", req.params.id);
        console.log("Update data:", updateData);

        // Find and update the event
        const updatedEvent = await EventModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,  // Return the updated document
                runValidators: true  // Run model validations
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

        // Optional: Delete the image from Cloudinary
        if (event.image) {
            const publicId = event.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`events/${publicId}`);
        }

        res.json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting event" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
