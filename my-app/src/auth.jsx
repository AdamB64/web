import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Start() {
    const [star, setStar] = useState(null);

    useEffect(() => {
        axios.post("http://localhost:8080/auth", {}, { withCredentials: true })
            .then(response => {
                console.log("Auth response:", response);
                setStar(response.data);
            })
            .catch(error => {
                console.error("Error fetching auth data:", error);
            });
    }, []); // Run only once on mount

    return (
        <div>
            <h2>Author</h2>
            {star ? (
                <div>
                    <p><strong>Username:</strong> {star.user.username}</p>
                    <p><strong>Average Stars:</strong> {star.averageStars}</p>
                </div>
            ) : (
                <p>Loading author info...</p>
            )}
        </div>
    );
}
