import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminPage = () => {
    const [accessGranted, setAccessGranted] = useState(false);
    const [password, setPassword] = useState('');
    const [users, setUsers] = useState([]);

    const handleAccessSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://localhost:8080/access', { password }, { withCredentials: true });


            if (response.status === 200) {
                toast.success('Access granted!');
                setAccessGranted(true);
                fetchUsers();
            } else if (response.status === 201) {
                alert('Must be logged in to access this page!');
                window.location.href = '/'; // redirect to home if status is not 200
            } else {
                toast.error('Access denied or invalid password! Please try again.');
                window.location.href = '/'; // redirect to home if status is not 200
            }
        } catch (error) {
            console.error('Access error:', error);
            window.location.href = '/'; // redirect to home on error
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.post('https://localhost:8080/get_users', {}, {
                withCredentials: true,
            });
            console.log('Fetched users:', response.data);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to load users');
        }
    };

    const deleteUser = async (userId) => {
        try {
            const response = await axios.post(`https://localhost:8080/delete_user/${userId}`, {}, {
                withCredentials: true,
            });
            console.log('Delete user response:', response.data);
            if (response.status === 200) {
                toast.success(`User ${userId} deleted`);
                setUsers((prev) => prev.filter((user) => user._id !== userId));
            } else if (response.status === 202) {
                toast.error('You do not have permission to delete yourself!');
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Something went wrong while deleting');
        }
    };

    if (!accessGranted) {
        return (
            <div style={{ padding: '20px' }}>
                <h2>🔐 Enter Admin Access Password</h2>
                <form onSubmit={handleAccessSubmit}>
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" style={{ marginLeft: '10px' }}>Enter</button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>👮 Admin User Panel</h2>
            <table border="1" cellPadding="10" style={{ width: '100%', marginTop: '10px' }}>
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>No users found.</td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user._id}>
                                <td>{user._id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    <button onClick={() => deleteUser(user._id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    );
};

export default AdminPage;
