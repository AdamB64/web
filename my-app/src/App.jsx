import { Routes, Route, Link } from 'react-router-dom'
import User from './user.jsx'
import Start from './start.jsx'
import Signup from './signup.jsx'
import Login from './login.jsx'
import Write from './write.jsx'
import StoryPage from './StoryPage.jsx'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

function Home() {
  const [story, setStory] = useState(null)

  useEffect(() => {
    axios.post('http://localhost:8080/home', {})
      .then(response => {
        setStory(response.data.newestStory)
      })
      .catch(error => {
        console.error('Error:', error)
      })
  }, [])

  return (
    <div>
      <h2>This is my library where anyone can make a story</h2>
      <h3>Go to the start page and find all the stories made by other people on this website</h3>
      <p>Or sign-up/login to an account and create your own stories, where you can publish them anonymously or with your account credited for the story</p>

      {story && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '2rem' }}>
          <h3><a href={`/story/${story._id}`}>{story.title}</a></h3>
          <p><strong>Author ID:</strong> {story.Anomymous ? 'anonymous' : story.AuthorID}</p>
          {!story.Anomymous && (
            <p><strong>Username:</strong> {story.username}</p>
          )}
          <p><strong>Genres:</strong> {story.genres.join(', ')}</p>
          <p><strong>Content:</strong></p>
          <p>{story.content}</p>
          {story && (
            <div>
              <strong>Reviews:</strong>
              {Array.isArray(story.Reviews) && story.Reviews.length > 0 ? (
                <ul>
                  {story.Reviews.map((review, index) => (
                    <li key={index} style={{ marginBottom: '1rem' }}>
                      <p><strong>User ID:</strong> {review.UserID}</p>
                      <p><strong>Stars:</strong> {review.Stars}</p>
                      <p>{review.ReviewText}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No reviews yet.</p>
              )}
            </div>
          )}

        </div>
      )}
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
                  Signup
                </Link>
              </li>
              <li>
                <Link to="/user" style={{ color: 'white', textDecoration: 'none' }}>
                  User
                </Link>
              </li>
              <li>
                <Link to="/write" style={{ color: 'white', textDecoration: 'none' }}>
                  Write
                </Link>
              </li>
              <li>
                <Link to="/start" style={{ color: 'white', textDecoration: 'none' }}>
                  Start
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
          <Route path="/story/:id" element={<StoryPage />} /> {/* ✅ Add this line */}
        </Routes>
      </main>
    </div>
  )
}
