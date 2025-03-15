const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    eventname: { type: String, required: true },
    eventplace: { type: String, required: true },
    eventdate: {
        type: Date,
        required: true,
        set: (val) => val ? new Date(val.setHours(0, 0, 0, 0)) : val  // Store only date part
    },
    image: { type: String, required: false }
}, { timestamps: true });

const EventModel = mongoose.model("Event", EventSchema);
module.exports = EventModel;