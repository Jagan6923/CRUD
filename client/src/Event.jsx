import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import config from "./config";
function Event() {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`${config.apiBaseUrl}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 5000
                });

                if (Array.isArray(response.data)) {
                    setEvents(response.data);
                } else {
                    setError("Unexpected data format received");
                }
            } catch (err) {
                if (err.response) {
                    setError(err.response.data.error || "Failed to fetch events");
                } else if (err.request) {
                    setError("No response from server");
                } else {
                    setError("Error setting up request");
                }
            }
        };

        fetchEvents();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${config.apiBaseUrl}/deleteEvent/${id}`);
            setEvents(events.filter(event => event._id !== id));
        } catch (err) {
            console.error("Error deleting event:", err);
        }
    };

    const fallbackImage = "https://via.placeholder.com/200";

    return (
        <div className="container py-5">
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Events</h2>
                <Link to="/create" className="custom-btn">Add Event +</Link>
            </div>
            <div className="row">
                {events.map(event => (
                    <div key={event._id} className="col-md-4 mb-4">
                        <div className="card shadow-sm">
                            <img
                                src={event.image || fallbackImage}
                                alt={event.eventname || "Event Image"}
                                className="card-img-top"
                                onError={(e) => { e.target.src = fallbackImage; }}
                                style={{ height: "200px", objectFit: "cover" }}
                            />
                            <div className="card-body">
                                <h5 className="card-title">{event.eventname}</h5>
                                <p className="card-text"><strong>Place:</strong> {event.eventplace}</p>
                                <p className="card-text"><strong>Date:</strong> {event.eventdate}</p>
                                <div className="d-flex justify-content-between">
                                    <Link to={`/update/${event._id}`} className="custom-btn update-btn">Update</Link>
                                    <button className="custom-btn delete-btn" onClick={() => handleDelete(event._id)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Event;
