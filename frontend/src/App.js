import React, { useEffect, useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainApp />
      </Router>
    </AuthProvider>
  );
}

// 🔒 Wrapper for private routes
function RequireAuth({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function MainApp() {
  const { user, token, logout, api } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const fetchPosts = () => {
    api
      .get("/posts")
      .then((res) => setPosts(res.data))
      .catch(() => setError("❌ Failed to load posts"));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token) {
      setError("⚠️ Please login first!");
      return;
    }

    const request = editingId
      ? api.put(`/posts/${editingId}`, { title, content })
      : api.post("/posts", { title, content });

    request
      .then(() => {
        fetchPosts();
        setTitle("");
        setContent("");
        setEditingId(null);
        setError("");
      })
      .catch(() => setError("❌ Failed to save post"));
  };

  const handleEdit = (post) => {
    setEditingId(post._id);
    setTitle(post.title);
    setContent(post.content);
  };

  const handleDelete = (id) => {
    if (!token) {
      setError("⚠️ Please login first!");
      return;
    }
    api
      .delete(`/posts/${id}`)
      .then(() => fetchPosts())
      .catch(() => setError("❌ Failed to delete post"));
  };

  return (
    <div className="App">
      {/* ✅ Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link to="/" className="navbar-brand newspaper-title">
            📰 My Blog Times
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNav"
          >
            <ul className="navbar-nav align-items-lg-center">
              {user ? (
                <>
                  <li className="nav-item">
                    <span className="nav-link text-white">
                      Hi, {user.username}
                    </span>
                  </li>
                  <li className="nav-item">
                    <button
                      onClick={logout}
                      className="btn btn-sm btn-danger ms-lg-2"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="btn btn-sm btn-light me-2">
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/signup" className="btn btn-sm btn-secondary">
                      Signup
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <Routes>
        {/* 🏠 Protected Home / Posts */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <div className="container my-5">
                <div className="mb-5">
                  <h2 className="newspaper-heading mb-4">
                    {editingId ? "✏️ Edit Article" : "🖋️ Write a New Article"}
                  </h2>

                  {error && (
                    <div className="alert alert-danger">{error}</div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="p-4 border bg-light shadow-sm"
                  >
                    <div className="mb-3">
                      <label className="form-label newspaper-title">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter article title"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label newspaper-title">
                        Content
                      </label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your story..."
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-dark me-2">
                      {editingId ? "Update" : "Publish"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditingId(null);
                          setTitle("");
                          setContent("");
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </form>
                </div>

                {/* Blog Posts */}
                <h2 className="newspaper-heading mb-4">Latest Articles</h2>
                {posts.length === 0 ? (
                  <p className="text-center text-muted">
                    No articles published yet.
                  </p>
                ) : (
                  <div className="row g-4">
                    {posts.map((post) => (
                      <div key={post._id} className="col-12 col-md-6 col-lg-4">
                        <div className="card border-dark shadow-sm h-100">
                          <div className="card-body">
                            <h5 className="card-title newspaper-title">
                              {post.title}
                            </h5>
                            <p className="card-text">{post.content}</p>
                          </div>
                          {user && (
                            <div className="card-footer bg-transparent border-dark d-flex justify-content-between">
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleEdit(post)}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn btn-sm btn-dark"
                                onClick={() => handleDelete(post._id)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </RequireAuth>
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>

      {/* Footer */}
      <footer className="footer bg-dark text-white text-center py-3">
        <p className="mb-0 newspaper-footer">
          © {new Date().getFullYear()} My Blog Times | Crafted with 🖋️
        </p>
      </footer>
    </div>
  );
}

export default App;
