import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function User() {
    const userRef = useRef(null);
    const userDiv = useRef(null);
    const [user, setUser] = useState(null);
    const [stories, setStories] = useState([]);
    const [newRole, setNewRole] = useState("");

    useEffect(() => {
        axios.post("http://localhost:8080/logged-in", {
            status: "yes"
        }, {
            withCredentials: true,
        })
            .then(response => {
                if (response.status === 201) {
                    toast.error("User is not logged in\nRedirecting to login page...");
                    setTimeout(() => {
                        window.location.href = "http://localhost:5173/login";
                    }, 2500);
                } else if (response.status === 200) {
                    const userData = response.data.decodedToken;
                    console.log("User data:", userData); // Log the user data for debugging
                    setUser({
                        id: userData.id,
                        email: userData.email,
                        username: userData.username,
                        anonymous: userData.anonymous,
                        author_or_reader: userData.author_or_reader
                    });

                    console.log("User stories:", response.data.stories); // Log the stories for debugging
                    setStories(response.data.stories);
                    setNewRole(userData.author_or_reader); // set default selected role
                    toast.success("User " + userData.username + " is logged in");
                    if (userRef.current) {
                        userRef.current.textContent = "Welcome, " + userData.username;
                    }
                }
            })
            .catch(error => {
                console.error("Error:", error);
                toast.error("An error occurred while checking login status.");
            });
    }, []);

    const handleChangeRole = () => {
        if (!newRole) {
            toast.error("Please select a valid role.");
            return;
        }

        if (newRole === user.author_or_reader) {
            toast.info("Selected role is the same as the current one.");
            return;
        }

        const confirmChange = window.confirm(`Are you sure you want to change your role to "${newRole}"?`);
        if (!confirmChange) return;

        axios.post("http://localhost:8080/change_auth", {
            newRole: newRole
        }, {
            withCredentials: true,
        })
            .then(response => {
                if (response.status === 200) {
                    toast.success("Role updated successfully!");
                    setUser(prev => ({
                        ...prev,
                        author_or_reader: newRole
                    }));
                } else {
                    toast.error("Failed to update role.");
                }
            })
            .catch(error => {
                console.error("Error updating role:", error);
                toast.error("An error occurred while updating role.");
            });
    };

    function changePassword() {
        const oldPassword = prompt("Please enter your current password:");
        if (!oldPassword) {
            toast.error("Old password is required.");
            return;
        }

        const newPassword = prompt("Please enter your new password:");
        if (!newPassword) {
            toast.error("New password is required.");
            return;
        }
        axios.post("http://localhost:8080/change_password", {
            Password: newPassword,
            oldPassword: oldPassword
        }, {
            withCredentials: true,
        })
            .then(response => {
                if (response.status === 200) {
                    toast.success("Password updated successfully!");
                } else {
                    toast.error("Failed to update password.");
                }
            })
            .catch(error => {
                console.error("Error updating password:", error);
                toast.error("An error occurred while updating password.");
            });
    }

    function changeAn() {
        const confirmChange = window.confirm("Are you sure you want to change your anonymity status?");
        if (!confirmChange) return;

        axios.post("http://localhost:8080/changeAn", {
            anonymous: !user.anonymous
        }, {
            withCredentials: true,
        })
            .then(response => {
                if (response.status === 200) {
                    toast.success("Anonymity status updated successfully!");
                    setUser(prev => ({
                        ...prev,
                        anonymous: !prev.anonymous
                    }));
                } else {
                    toast.error("Failed to update anonymity status.");
                }
            })
            .catch(error => {
                console.error("Error updating anonymity status:", error);
                toast.error("An error occurred while updating anonymity status.");
            });
    }

    function ChangeVis(storyId) {
        const confirmChange = window.confirm("Are you sure you want to change the visibility of this story?");
        if (!confirmChange) return;

        axios.post("http://localhost:8080/changeVis", {
            storyId: storyId
        }, {
            withCredentials: true,
        })
            .then(response => {
                if (response.status === 200) {
                    toast.success("Visibility updated successfully!");
                    setStories(prev => prev.map(story => story._id === storyId ? { ...story, Private: !story.Private } : story));
                } else {
                    toast.error("Failed to update visibility.");
                }
            })
            .catch(error => {
                console.error("Error updating visibility:", error);
                toast.error("An error occurred while updating visibility.");
            });
    }

    return (
        <div>
            <h2 ref={userRef} style={{
                color: "#2c3e50",
                backgroundColor: "#ecf0f1",
                padding: "1rem",
                borderRadius: "8px"
            }}></h2>
            <div ref={userDiv} style={{
                marginTop: "1rem",
                color: "#34495e",
                backgroundColor: "#ecf0f1",
                padding: "1rem",
                borderRadius: "8px"
            }}>
                {user && (
                    <div style={{ marginTop: "1rem" }}>
                        <p><strong>User ID:</strong> {user.id}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Anonymous:</strong> {user.anonymous ? "Yes" : "No"}</p>
                        <button onClick={changeAn}>change anonymous status</button>
                        <p>
                            <strong>Current Role:</strong> {user.author_or_reader}
                        </p>
                        <div style={{ marginTop: "1rem" }}>
                            <label htmlFor="roleSelect"><strong>Change Role:</strong> </label>
                            <select
                                id="roleSelect"
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                style={{ marginLeft: "0.5rem" }}
                            >
                                <option value="author">Author</option>
                                <option value="reader">Reader</option>
                                <option value="both">Both</option>
                            </select>
                            <button
                                onClick={handleChangeRole}
                                style={{ marginLeft: "1rem", padding: "0.25rem 0.75rem", cursor: "pointer" }}
                            >
                                Change Role
                            </button><br></br>
                            <br></br>
                            <label htmlFor="password"><strong>Change Password:</strong></label>
                            <button onClick={changePassword} style={{ marginLeft: "1rem", padding: "0.25rem 0.75rem", cursor: "pointer" }}>
                                Change Password
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {stories.length > 0 && (
                <div style={{ marginTop: "2rem", backgroundColor: "#000000", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
                    <h3 style={{ color: "#2c3e50" }}>Your Stories</h3>
                    {stories.map((story, index) => (
                        <li key={index} style={{ marginBottom: "1rem" }}>
                            <strong>Title:</strong>
                            <a href={`/story/${story._id}`}> {story.title}</a>
                            <button onClick={() => ChangeVis(story._id)} style={{ marginLeft: "1rem" }}>
                                Change Visibility
                            </button>
                            <br />

                            <strong>Genre(s):</strong> {Array.isArray(story.genres) ? story.genres.join(', ') : 'N/A'} < br />
                            <strong>Content:</strong><br />
                            {story.content}
                        </li>
                    ))}
                </div>
            )
            }


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
        </div >
    );
}
