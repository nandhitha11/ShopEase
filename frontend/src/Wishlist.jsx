
import { useEffect, useState } from 'react'

function Wishlist({ onBack }) {
  const [wishlist, setWishlist] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const loadWishlist = async () => {
    const token = localStorage.getItem('accessToken')

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/wishlist/',
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Unable to load wishlist')
      }

      const data = await response.json()

      setWishlist(data)
    } catch (error) {
      console.error(error)
      setMessage('❌ Unable to load wishlist')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWishlist()
  }, [])

  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem('accessToken')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/wishlist/remove/${productId}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      )

      const data = await response.json()

      if (response.ok) {
        setWishlist((currentWishlist) =>
          currentWishlist.filter(
            (item) => item.product !== productId
          )
        )

        setMessage('💔 Removed from wishlist')
      } else {
        setMessage(
          '❌ ' +
            (data.error || 'Unable to remove from wishlist')
        )
      }
    } catch (error) {
      console.error(error)
      setMessage('❌ Unable to connect to server')
    }
  }

  const addToCart = async (productId) => {
    const token = localStorage.getItem('accessToken')

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/cart/add/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            product: productId,
            quantity: 1,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ Product added to cart!')
      } else {
        setMessage(
          '❌ ' +
            (data.error || 'Unable to add product to cart')
        )
      }
    } catch (error) {
      console.error(error)
      setMessage('❌ Unable to connect to server')
    }
  }

  return (
    <div className="min-vh-100 bg-light">

      {/* NAVBAR */}
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand fw-bold">
            🛍️ ShopEase
          </span>

          <button
            className="btn btn-outline-light"
            onClick={onBack}
          >
            ← Back to Shop
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="container py-5">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-1">
              ❤️ My Wishlist
            </h1>

            <p className="text-muted mb-0">
              {wishlist.length} saved product
              {wishlist.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="alert alert-info text-center">
            {message}

            <button
              className="btn-close float-end"
              onClick={() => setMessage('')}
            ></button>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border"
              role="status"
            ></div>

            <p className="text-muted mt-3">
              Loading wishlist...
            </p>
          </div>
        ) : wishlist.length === 0 ? (

          /* EMPTY WISHLIST */
          <div className="text-center py-5">
            <div
              style={{
                fontSize: '90px',
              }}
            >
              🤍
            </div>

            <h3 className="fw-bold mt-3">
              Your wishlist is empty
            </h3>

            <p className="text-muted">
              Save products you love and find them here
              later.
            </p>

            <button
              className="btn btn-dark mt-2"
              onClick={onBack}
            >
              Start Shopping →
            </button>
          </div>

        ) : (

          /* WISHLIST PRODUCTS */
          <div className="row g-4">

            {wishlist.map((item) => (
              <div
                className="col-sm-6 col-md-4 col-lg-3"
                key={item.id}
              >
                <div
                  className="card h-100 border-0 shadow-sm"
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                  }}
                >

                  {/* IMAGE */}
                  <div
                    className="bg-white d-flex align-items-center justify-content-center"
                    style={{
                      height: '220px',
                    }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          padding: '15px',
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: '80px',
                        }}
                      >
                        🛍️
                      </span>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="card-body d-flex flex-column">

                    <small className="text-muted">
                      {item.category || 'Product'}
                    </small>

                    <h5 className="fw-bold mt-1">
                      {item.name}
                    </h5>

                    <p
                      className="text-muted small"
                      style={{
                        minHeight: '40px',
                      }}
                    >
                      {item.description}
                    </p>

                    <h5 className="fw-bold">
                      ₹{item.price}
                    </h5>

                    {/* STOCK */}
                    <small
                      className={
                        item.stock > 0
                          ? 'text-success fw-semibold mb-3'
                          : 'text-danger fw-semibold mb-3'
                      }
                    >
                      {item.stock > 0
                        ? `✓ ${item.stock} items available`
                        : '✕ Out of stock'}
                    </small>

                    {/* ADD TO CART */}
                    <button
                      className="btn btn-dark w-100 mb-2"
                      disabled={item.stock === 0}
                      onClick={() =>
                        addToCart(item.product)
                      }
                    >
                      {item.stock === 0
                        ? 'Out of Stock'
                        : '🛒 Add to Cart'}
                    </button>

                    {/* REMOVE */}
                    <button
                      className="btn btn-outline-danger w-100"
                      onClick={() =>
                        removeFromWishlist(item.product)
                      }
                    >
                      ❤️ Remove
                    </button>

                  </div>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist

