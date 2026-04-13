import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container mt-5">
      <div className="jumbotron p-5 bg-light rounded text-center">
        <h1 className="display-4">Welcome to SyncSport!</h1>
        <p className="lead">Your ultimate destination for synchronizing sports activities.</p>
        <hr className="my-4" />
        <p>Built with React, Vite, TypeScript, Bootstrap, and React Router.</p>
        <Link className="btn btn-primary btn-lg" to="/about" role="button">Learn more</Link>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="container mt-5">
      <h2>About SyncSport</h2>
      <p>This is a sample application demonstrating Bootstrap components and React Router navigation.</p>
      <Link className="btn btn-secondary" to="/">Go Back Home</Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">SyncSport</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/about">About</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
