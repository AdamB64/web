import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import User from './user.jsx'
import Start from './start.jsx'
import Signup from './signup.jsx'
import Login from './login.jsx'
import Write from './write.jsx'
import StoryPage from './StoryPage.jsx'
import Admin from './admin.jsx'
import Claim from './claim.jsx'
import Auth from './auth.jsx'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function Home() {
  const [reviewText, setReviewText] = useState('');
  const [stars, setStars] = useState(0);
  const [story, setStory] = useState(null)
  const [storyId, setStoryId] = useState(null)

  useEffect(() => {
    axios.post('http://localhost:8080/home', {})
      .then(response => {
        setStory(response.data.newestStory)
        setStoryId(response.data.newestStory._id)
      })
      .catch(error => {
        console.error('Error:', error)
      })
  }, [])


  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const reviewData = {
        Stars: stars,
        ReviewText: reviewText
      };
      const response = await axios.post(`http://localhost:8080/story/${storyId}/review`, reviewData, {
        withCredentials: true,
      });
      if (response.status === 201) {
        toast.error('Must be logged in to leave a review!');
      } else {
        // Refresh the story to show new review
        setReviewText('');
        setStars(0);
        window.location.reload();

      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  return (
    <div>
      <h2>This is my library where anyone can make a story</h2>
      <h3>Go to the story ranking page and find all the stories made by other people on this website</h3>
      <p>Or sign-up/login to an account and create your own stories, where you can publish them anonymously or with your account credited for the story</p>
      <h2>Newest Story</h2>
      {!story && <p>No new Stories</p>}
      {story && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '2rem' }}>
          <h3><a href={`/story/${story._id}`}>{story.title}</a></h3>
          {story.Author === "Guest" ? (
            <p><strong>User:</strong> {story.Author}</p>
          ) : (
            <>
              <p><strong>Story ID:</strong> {story._id}</p>
              <p><strong>Author ID:</strong> {story.Anonymous ? 'anonymous' : story.AuthorID}</p>
              {!story.Anonymous && (
                <p><strong>Username:</strong> {story.Author}</p>
              )}
            </>
          )}
          <p><strong>Average Starts: </strong>{story.Stars}</p>
          <p><strong>Genres:</strong> {story.genres.join(', ')}</p>
          <p><strong>Content:</strong></p>
          <p>{story.content}</p>
          {story && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ color: 'white' }}>Reviews:</h3>
              {Array.isArray(story.Reviews) && story.Reviews.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    maxHeight: '300px', // around 2 reviews tall
                    overflowY: 'auto',
                    paddingRight: '0.5rem',
                  }}
                >
                  {story.Reviews.map((review, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: '#1e1e1e',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #444',
                        color: 'white',
                      }}
                    >
                      <p style={{ marginBottom: '0.5rem' }}>
                        <strong>User:</strong> {review.User}
                      </p>
                      <p style={{ marginBottom: '0.5rem' }}>
                        <strong>Stars:</strong> {'⭐'.repeat(review.Stars)}
                      </p>
                      <p style={{ fontStyle: 'italic' }}>{review.ReviewText}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#aaa' }}>No reviews yet.</p>
              )}
            </div>
          )}

          <div style={{ alignItems: 'center', textAlign: 'center' }}>
            <h3 style={{ marginTop: '3rem' }}>Leave a Review(must be logged in)</h3>
            <form
              onSubmit={handleReviewSubmit}
              style={{
                gap: '0.8rem',
                maxWidth: '400px',
                width: '100%',
              }}
            >
              <label>
                Stars (0–5):
                <input
                  type="number"
                  value={stars}
                  onChange={(e) => setStars(parseInt(e.target.value))}
                  min="0"
                  max="5"
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginTop: '0.3rem',
                    backgroundColor: '#333',
                    border: '1px solid #555',
                    borderRadius: '4px',
                  }}
                />
              </label>

              <label>
                Review:
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '100px',
                    padding: '0.5rem',
                    marginTop: '0.3rem',
                    backgroundColor: '#333',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    resize: 'vertical',
                  }}
                />
              </label>

              <button
                type="submit"
                style={{
                  color: 'white',
                  backgroundColor: '#222',
                  padding: '0.7rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

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
  )
}

export default function App() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>
      {/* Top Bar Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          backgroundColor: 'black',
          color: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          zIndex: 1000,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>My Library</h1>
          <nav>
            <ul
              style={{
                display: 'flex',
                listStyle: 'none',
                gap: '20px',
                margin: 0,
                padding: 0,
              }}
            >
              <li>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/signup" style={{ color: 'white', textDecoration: 'none' }}>
                  Sign up
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/user" style={{ color: 'white', textDecoration: 'none' }}>
                  User
                </Link>
              </li>
              <li>
                <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>
                  Admin
                </Link>
              </li>
              <li>
                <Link to="/write" style={{ color: 'white', textDecoration: 'none' }}>
                  Write
                </Link>
              </li>
              <li>
                <Link to="/claim" style={{ color: 'white', textDecoration: 'none' }}>
                  Claim/Edit
                </Link>
              </li>
              <li>
                <Link to="/start" style={{ color: 'white', textDecoration: 'none' }}>
                  Story Rankings
                </Link>
              </li>
              <li>
                <Link to='/auth' style={{ color: 'white', textDecoration: 'none' }}>
                  Author Ranking
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main style={{ padding: '100px 20px 30px', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/User" element={<User />} />
          <Route path="/start" element={<Start />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/write" element={<Write />} />
          <Route path="/story/:id" element={<StoryPage />} />
          <Route path="/claim" element={<Claim />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<h2>404 Not Found</h2>} />
        </Routes>
      </main>
    </div>
  )
}
