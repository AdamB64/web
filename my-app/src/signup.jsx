import React from "react";

export default function Signup() {
    return (
        <div>
            <h2>Sign Up</h2>
            <form action="http://localhost:8080/signup" method="post">
                <label htmlFor="email">Email:</label><br />
                <input type="email" id="email" name="email" required /><br />

                <label htmlFor="username">Username:</label><br />
                <input type="text" id="username" name="username" required /><br />

                <label htmlFor="password">Password:</label><br />
                <input type="password" id="password" name="password" required /><br /><br />

                <label htmlFor="a_or_r">Are you an author or a reader or both?</label>
                <p>you can change this later in users page</p>
                <select id="a_or_r" name="a_or_r" required>
                    <option value="author">Author</option>
                    <option value="reader">Reader</option>
                    <option value="both">Both</option>
                </select><br /><br />

                <input type="checkbox" id="anonymous" name="anonymous" />
                <label htmlFor="anonymous">Do you wish to be anonymous?</label><br /><br />

                <input type="submit" value="Submit" />
            </form>
            <p>
                Already have an account?{" "}
                <a href="http://localhost:5173/login">Login</a>
            </p>
        </div>
    );
}
