import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "./config";

function CreateEvent() {
    const [eventname, setEventName] = useState("");
    const [eventplace, setEventPlace] = useState("");
    const [eventdate, setEventDate] = useState("");
    const [image, setImage] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!eventname || !eventplace || !eventdate) {
            setError("Please fill in all required fields");
            return;
        }

        const formData = new FormData();
        formData.append("eventname", eventname);
        formData.append("eventplace", eventplace);
        formData.append("eventdate", eventdate);

        if (image) {
            formData.append("image", image);
        }

        try {
            const response = await axios.post(`${config.apiBaseUrl}/createEvent`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Event created successfully:", response.data);
            navigate("/");
        } catch (error) {
            console.error("Error creating event:", error);
            setError(error.response?.data?.error || "An error occurred");
        }
    };
    return (
        <div className="d-flex vh-100 bg-primary justify-content-center align-items-center">
            <div className="w-50 bg-white rounded p-3">
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <h2>Add Event</h2>
                    <div className="mb-2">
                        <label htmlFor="name">Event Name</label>
                        <input
                            id="name"
                            type="text"
                            className="form-control"
                            placeholder="Enter event name"
                            value={eventname}
                            onChange={(e) => setEventName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="place">Place</label>
                        <input
                            id="place"
                            type="text"
                            className="form-control"
                            placeholder="Enter event place"
                            value={eventplace}
                            onChange={(e) => setEventPlace(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="date">Date</label>
                        <input
                            id="date"
                            type="date"
                            className="form-control"
                            value={eventdate}
                            onChange={(e) => setEventDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="image">Upload Image</label>
                        <input
                            id="image"
                            type="file"
                            className="form-control"
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </div>
                    <button type="submit" className="custom-btn update-btn">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default CreateEvent;
