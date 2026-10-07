
import { useState } from 'react'

function ProductDetails({ product, onBack, onAddToCart }) {
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h3>Product not found</h3>
        <button className="btn btn-dark mt-3" onClick={onBack}>
          ← Back to Products
        </button>
      </div>
    )
  }

  const discount =
    product.discount !== undefined && product.discount !== null
      ? Number(product.discount)
      : 0

  const rating =
    product.rating !== undefined && product.rating !== null
      ? Number(product.rating)
      : 4.5

  const originalPrice =
    discount > 0
      ? Math.round(Number(product.price) / (1 - discount / 100))
      : null

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleAddToCart = async () => {
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
            product: product.id,
            quantity: quantity,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ Product added to cart successfully!')
      } else {
        setMessage(
          '❌ ' + (data.error || 'Unable to add product')
        )
      }
    } catch (error) {
      console.error(error)
      setMessage('❌ Unable to connect to server')
    }
  }

  return (
    <div className="bg-light min-vh-100">
      {/* NAVBAR */}
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <button
            className="btn btn-link text-white text-decoration-none fw-bold"
            onClick={onBack}
          >
            🛍️ ShopEase
          </button>

          <button
            className="btn btn-outline-light"
            onClick={onBack}
          >
            ← Back to Products
          </button>
        </div>
      </nav>

      {/* PRODUCT DETAILS */}
      <div className="container py-5">

        {message && (
          <div className="alert alert-info text-center">
            {message}

            <button
              className="btn-close float-end"
              onClick={() => setMessage('')}
            ></button>
          </div>
        )}

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">

            <div className="row align-items-center">

              {/* IMAGE */}
              <div className="col-md-6 mb-4 mb-md-0">
                <div
                  className="bg-light rounded d-flex align-items-center justify-content-center position-relative"
                  style={{
                    height: '450px',
                    overflow: 'hidden',
                  }}
                >

                  {discount > 0 && (
                    <span
                      className="badge bg-danger position-absolute top-0 start-0 m-3"
                      style={{
                        padding: '8px 12px',
                        fontSize: '14px',
                      }}
                    >
                      {discount}% OFF
                    </span>
                  )}

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: '30px',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '130px' }}>
                      🛍️
                    </span>
                  )}
                </div>
              </div>

              {/* INFORMATION */}
              <div className="col-md-6">

                <small className="text-muted">
                  {product.category?.name || 'Product'}
                </small>

                <h1 className="fw-bold mt-2">
                  {product.name}
                </h1>

                {/* RATING */}
                <div className="mb-3">
                  <span className="text-warning fs-5">
                    {'★'.repeat(Math.floor(rating))}
                  </span>

                  <span className="text-secondary fs-5">
                    {'★'.repeat(5 - Math.floor(rating))}
                  </span>

                  <span className="text-muted ms-2">
                    {rating.toFixed(1)} / 5
                  </span>
                </div>

                {/* PRICE */}
                <div className="mb-4">

                  <span className="fw-bold display-6">
                    ₹{product.price}
                  </span>

                  {originalPrice && (
                    <span
                      className="text-muted ms-3 fs-5"
                      style={{
                        textDecoration: 'line-through',
                      }}
                    >
                      ₹{originalPrice}
                    </span>
                  )}

                  {discount > 0 && (
                    <span className="text-success fw-bold ms-3">
                      Save {discount}%
                    </span>
                  )}
                </div>

                <hr />

                {/* DESCRIPTION */}
                <h5 className="fw-bold mt-4">
                  Product Description
                </h5>

                <p className="text-muted">
                  {product.description ||
                    'No description available for this product.'}
                </p>

                {/* STOCK */}
                <div className="mb-4">
                  {product.stock > 0 ? (
                    <span className="text-success fw-semibold">
                      ✓ {product.stock} items available
                    </span>
                  ) : (
                    <span className="text-danger fw-semibold">
                      ✕ Out of stock
                    </span>
                  )}
                </div>

                {/* QUANTITY */}
                {product.stock > 0 && (
                  <div className="mb-4">
                    <label className="fw-semibold d-block mb-2">
                      Quantity
                    </label>

                    <div
                      className="d-flex align-items-center"
                      style={{ width: '150px' }}
                    >
                      <button
                        className="btn btn-outline-dark"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                      >
                        −
                      </button>

                      <div
                        className="border-top border-bottom text-center fw-bold"
                        style={{
                          width: '60px',
                          padding: '7px',
                        }}
                      >
                        {quantity}
                      </div>

                      <button
                        className="btn btn-outline-dark"
                        onClick={increaseQuantity}
                        disabled={quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* ADD TO CART */}
                <button
                  className="btn btn-dark btn-lg w-100"
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                >
                  {product.stock === 0
                    ? 'Out of Stock'
                    : `🛒 Add ${quantity} to Cart`}
                </button>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ProductDetails

