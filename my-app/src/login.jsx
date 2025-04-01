export default function Login() {
    return (
        <div>
            <h2>Login</h2>
            <form action="http://localhost:8080/login" method="post">
                <label htmlFor="username">Username:</label><br />
                <input type="text" id="username" name="username" required /><br />

                <label htmlFor="password">Password:</label><br />
                <input type="password" id="password" name="password" required /><br /><br />

                <input type="submit" value="Submit" />
            </form>
            <p>
                Don't have an account?{" "}
                <a href="http://localhost:5173/signup">Sign Up</a>
            </p>
        </div>
    )
}
