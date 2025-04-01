import { useEffect } from 'react';
import axios from 'axios';

export default function Start() {
    useEffect(() => {
        axios.post("http://localhost:8080/get-start").then(response => {
            console.log("Start page data:", response.data); // Handle the response data as needed
        }).catch(error => {
            console.error("Error fetching start page data:", error); // Handle any errors
        });
    }); // Empty dependency array means this effect runs once on mount

    return (
        <div>
            <h2>Start</h2>
        </div>
    )
}
