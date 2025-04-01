import { useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function User() {
    const userRef = useRef(null);
    const userDiv = useRef(null);

    useEffect(() => {
        axios.post("http://localhost:8080/logged-in", {
            status: "yes"
        }, {
            withCredentials: true, // include credentials in the request
        })
            .then(response => {
                if (response.status === 201) {
                    toast.error("User is not logged in \n being redirected to login page"); // User is not logged in
                    setTimeout(() => {
                        window.location.href = "http://localhost:5173/login";
                    }, 2500); // 2 seconds delay
                } else if (response.status === 200) {
                    const user = response.data.decodedToken; // ✅ get the username from the token
                    toast.success("user " + user.username + " is logged in");

                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }, []);

    const UserLog = () => {
        window.location.href = "http://localhost:5173/login"; // Redirect to the login page
    };

    return (
        <div>
            <h2 ref={userRef}></h2>
            <div ref={userDiv}>
            </div>
            {/* This must be included once in your component tree */}
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    );
}
