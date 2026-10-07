
import { useEffect, useState } from 'react'
import Checkout from './Checkout'

function Cart({ onBack }) {
  const [cart, setCart] = useState(null)
  const [message, setMessage] = useState('')
  const [order, setOrder] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)

  const token = localStorage.getItem('accessToken')

  const loadCart = () => {
    fetch('http://127.0.0.1:8000/api/cart/', {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load cart')
        }

        return response.json()
      })
      .then((data) => {
        setCart(data)
      })
      .catch((error) => {
        console.error(error)
        setMessage('Unable to load cart')
      })
  }

  useEffect(() => {
    loadCart()
  }, [])

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      return
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/cart/update/${productId}/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            quantity: quantity,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        loadCart()
        setMessage('')
      } else {
        setMessage(data.error || 'Unable to update quantity')
      }
    } catch (error) {
      console.error(error)
      setMessage('Unable to connect to server')
    }
  }

  const removeItem = async (productId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/cart/remove/${productId}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      )

      if (response.ok) {
        loadCart()
        setMessage('')
      } else {
        setMessage('Unable to remove product')
      }
    } catch (error) {
      console.error(error)
      setMessage('Unable to connect to server')
    }
  }

  const getTotal = () => {
    if (!cart || !cart.items) {
      return 0
    }

    return cart.items.reduce(
      (total, item) =>
        total +
        Number(item.product_price) * item.quantity,
      0
    )
  }

  // ORDER PLACED FROM CHECKOUT
  const handleOrderPlaced = (data) => {
    setOrder(data)

    setCart({
      ...cart,
      items: [],
    })

    setShowCheckout(false)
  }

  // SHOW CHECKOUT PAGE
  if (showCheckout) {
    return (
      <Checkout
        cart={cart}
        onBack={() => setShowCheckout(false)}
        onOrderPlaced={handleOrderPlaced}
      />
    )
  }

  // ORDER SUCCESS
  if (order) {
    return (
      <div className="container py-5">
        <div className="card shadow border-0">

          <div className="card-body text-center p-5">

            <div style={{ fontSize: '70px' }}>
              🎉
            </div>

            <h2 className="fw-bold mt-3">
              Order Placed Successfully!
            </h2>

            <p className="text-muted">
              Thank you for shopping with ShopEase.
            </p>

            <div className="alert alert-success mt-4">

              <strong>
                Order #{order.id}
              </strong>

              <br />

              Total Amount: ₹{order.total_amount}

              <br />

              Status: {order.status}

            </div>

            <button
              className="btn btn-dark mt-3"
              onClick={onBack}
            >
              Continue Shopping
            </button>

          </div>
        </div>
      </div>
    )
  }

  // LOADING
  if (!cart) {
    return (
      <div className="container py-5 text-center">
        <h3>Loading cart...</h3>
      </div>
    )
  }

  return (
    <div className="container py-5">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2 className="fw-bold">
          🛒 Your Cart
        </h2>

        <button
          className="btn btn-outline-dark"
          onClick={onBack}
        >
          ← Continue Shopping
        </button>

      </div>

      {/* MESSAGE */}
      {message && (
        <div className="alert alert-danger">
          {message}
        </div>
      )}

      {/* EMPTY CART */}
      {cart.items.length === 0 ? (

        <div className="text-center py-5">

          <div style={{ fontSize: '70px' }}>
            🛒
          </div>

          <h3>
            Your cart is empty
          </h3>

          <p className="text-muted">
            Add some products before checking out.
          </p>

          <button
            className="btn btn-dark mt-3"
            onClick={onBack}
          >
            Start Shopping
          </button>

        </div>

      ) : (

        <div className="row">

          {/* CART ITEMS */}
          <div className="col-md-8">

            {cart.items.map((item) => (

              <div
                className="card mb-3 shadow-sm border-0"
                key={item.id}
              >

                <div className="card-body">

                  <div className="row align-items-center">

                    {/* PRODUCT */}
                    <div className="col-md-5">

                      <h5>
                        {item.product_name}
                      </h5>

                      <p className="text-muted mb-0">
                        ₹{item.product_price}
                      </p>

                    </div>

                    {/* QUANTITY */}
                    <div className="col-md-4">

                      <div className="d-flex align-items-center gap-2">

                        <button
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            updateQuantity(
                              item.product,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity === 1}
                        >
                          −
                        </button>

                        <span className="fw-bold px-2">
                          {item.quantity}
                        </span>

                        <button
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            updateQuantity(
                              item.product,
                              item.quantity + 1
                            )
                          }
                        >
                          +
                        </button>

                      </div>

                    </div>

                    {/* REMOVE */}
                    <div className="col-md-3 text-end">

                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() =>
                          removeItem(item.product)
                        }
                      >
                        Remove
                      </button>

                    </div>

                  </div>

                </div>
              </div>
            ))}

          </div>

          {/* ORDER SUMMARY */}
          <div className="col-md-4">

            <div className="card shadow-sm border-0">

              <div className="card-body">

                <h4 className="fw-bold">
                  Order Summary
                </h4>

                <hr />

                <div className="d-flex justify-content-between">

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ₹{getTotal().toFixed(2)}
                  </strong>

                </div>

                <div className="d-flex justify-content-between mt-2">

                  <span>
                    Delivery
                  </span>

                  <span className="text-success">
                    Free
                  </span>

                </div>

                <hr />

                <div className="d-flex justify-content-between">

                  <strong>
                    Total
                  </strong>

                  <strong>
                    ₹{getTotal().toFixed(2)}
                  </strong>

                </div>

                {/* CHECKOUT BUTTON */}
                <button
                  className="btn btn-dark w-100 mt-4"
                  onClick={() => {
                    setMessage('')
                    setShowCheckout(true)
                  }}
                >
                  Proceed to Checkout →
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default Cart

