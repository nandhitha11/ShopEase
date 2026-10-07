import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()

    setMessage('Logging in...')

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/users/login/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('accessToken', data.access)
        localStorage.setItem('refreshToken', data.refresh)

        setMessage('Login successful! 🎉')

        onLogin()
      } else {
        setMessage(data.detail || 'Invalid username or password')
      }
    } catch (error) {
      setMessage('Unable to connect to server')
    }
  }

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center">

      <div className="container">

        <div className="row justify-content-center">

          <div className="col-md-5">

            <div className="card shadow border-0">

              <div className="card-body p-5">

                <h2 className="text-center fw-bold mb-2">
                  ShopEase
                </h2>

                <p className="text-center text-muted mb-4">
                  Login to your account
                </p>

                <form onSubmit={handleLogin}>

                  <div className="mb-3">

                    <label className="form-label">
                      Username
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      required
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label">
                      Password
                    </label>

                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                    />

                  </div>

                  <button
                    type="submit"
                    className="btn btn-dark w-100"
                  >
                    Login
                  </button>

                </form>

                {message && (
                  <div className="alert alert-info mt-4">
                    {message}
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Login