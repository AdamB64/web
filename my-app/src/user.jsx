import { useEffect, useRef } from "react";
import axios from "axios";

export default function User() {
    const userRef = useRef(null);
    const userInfo = useRef(null);
    const userDiv = useRef(null);

    useEffect(() => {
        axios.post("http://localhost:8080/logged-in", {
            status: "yes"
        }, {
            withCredentials: true, // include credentials in the request
        })
            .then(response => {
                if (response.status === 201) {
                    if (userRef.current) {
                        userRef.current.textContent = "No User Logged in"; // ✅ update the h2 text
                        userRef.current.style.color = "red"; // ✅ example: change text color
                        if (userInfo.current) {
                            userInfo.current.textContent = "Guest User"; // ✅ update the p text
                            userInfo.current.style.color = "red"; // ✅ example: change text color
                        }
                        if (userDiv.current) {
                            // Create Login button
                            const loginBtn = document.createElement("button");
                            loginBtn.textContent = "Login";
                            loginBtn.onclick = () => { UserLog() }; // Call UserLog function on click

                            // Line break
                            const br = document.createElement("br");

                            // Create Sign Up button
                            const signupBtn = document.createElement("button");
                            signupBtn.textContent = "Sign Up";
                            signupBtn.onclick = () => {
                                window.location.href = "http://localhost:5173/signup";
                            };

                            // Append them to the div
                            userDiv.current.appendChild(loginBtn);
                            userDiv.current.appendChild(br);
                            userDiv.current.appendChild(signupBtn);
                        }
                    }
                    return;
                } else if (response.status === 200) {
                    if (userRef.current) {
                        userRef.current.textContent = "User Logged in"; // ✅ update the h2 text
                        userRef.current.style.color = "green"; // ✅ example: change text color
                    }
                }
                console.log("Success:", response.data);
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
            <p ref={userInfo}></p>
            <div ref={userDiv}>
            </div>
        </div>
    );
}
