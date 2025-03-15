import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UpdateEvent = () => {
    const { id } = useParams();
    const [eventname, setEventName] = useState("");
    const [eventplace, setEventPlace] = useState("");
    const [eventdate, setEventDate] = useState("");
    const [currentImage, setCurrentImage] = useState(null);
    const [image, setImage] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await axios.get(`${config.apiBaseUrl}/getEvent/${id}`);
                console.log("API Response:", res.data);
                const { eventname, eventplace, eventdate, image } = res.data;

                const [day, month, year] = eventdate.split('-');
                const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

                setEventName(eventname);
                setEventPlace(eventplace);
                setEventDate(formattedDate);
                setCurrentImage(image);
            } catch (err) {
                console.error("Error fetching event:", err);
                setError("Failed to fetch event details");
            }
        };

        fetchEvent();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");

        if (!eventname || !eventplace || !eventdate) {
            setError("Please fill in all required fields");
            return;
        }

        const formData = new FormData();
        formData.append("eventname", eventname);
        formData.append("eventplace", eventplace);
        formData.append("eventdate", eventdate); // This should be in YYYY-MM-DD format

        if (image) {
            formData.append("image", image);
        }

        try {
            const res = await axios.put(`${config.apiBaseUrl}/updateEvent/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            console.log("Update Response:", res.data);
            navigate("/");
        } catch (err) {
            console.error("Error updating event:", err);
            setError(err.response?.data?.error || "An error occurred");
        }
    };

    return (
        <div className="d-flex vh-100 bg-primary justify-content-center align-items-center">
            <div className="w-50 bg-white rounded p-3">
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleUpdate} encType="multipart/form-data">
                    <h2>Update Event</h2>

                    <div className="mb-2">
                        <label htmlFor="name">Event Name</label>
                        <input
                            id="name"
                            type="text"
                            className="form-control"
                            value={eventname}
                            onChange={(e) => setEventName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-2">
                        <label htmlFor="place">Event Place</label>
                        <input
                            id="place"
                            type="text"
                            className="form-control"
                            value={eventplace}
                            onChange={(e) => setEventPlace(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-2">
                        <label htmlFor="date">Event Date</label>
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
                        <label htmlFor="image">Current Image</label>
                        {currentImage && (
                            <img
                                src={currentImage}
                                alt="Current Event"
                                style={{
                                    maxWidth: "200px",
                                    maxHeight: "200px",
                                    objectFit: "cover"
                                }}
                            />
                        )}
                    </div>

                    <div className="mb-2">
                        <label htmlFor="newImage">Upload New Image</label>
                        <input
                            id="newImage"
                            type="file"
                            className="form-control"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                setImage(file);

                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setCurrentImage(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </div>

                    <button type="submit" className="custom-btn update-btn">
                        Update Event
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateEvent;
