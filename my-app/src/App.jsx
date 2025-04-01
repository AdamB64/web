import { Routes, Route, Link } from 'react-router-dom'
import About from './about.jsx'

function Home() {
  return (
    <div>
      <h2>Home Page</h2>
      <p>Welcome to the homepage!</p>
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
                <Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main style={{ padding: '100px 20px 30px', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  )
}
