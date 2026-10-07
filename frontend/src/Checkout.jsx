
import { useState } from 'react'

function Checkout({ cart, onBack, onOrderPlaced }) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [paymentMethod, setPaymentMethod] =
    useState('Cash on Delivery')

  const [message, setMessage] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)

  const token = localStorage.getItem('accessToken')

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

  const placeOrder = async (e) => {
    e.preventDefault()

    setMessage('')

    if (!fullName.trim()) {
      setMessage('Please enter your full name')
      return
    }

    if (!phone.trim()) {
      setMessage('Please enter your phone number')
      return
    }

    if (!address.trim()) {
      setMessage('Please enter your delivery address')
      return
    }

    if (!city.trim()) {
      setMessage('Please enter your city')
      return
    }

    if (!pincode.trim()) {
      setMessage('Please enter your pincode')
      return
    }

    if (!/^\d{10}$/.test(phone)) {
      setMessage(
        'Please enter a valid 10-digit phone number'
      )
      return
    }

    if (!/^\d{6}$/.test(pincode)) {
      setMessage(
        'Please enter a valid 6-digit pincode'
      )
      return
    }

    setPlacingOrder(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/orders/create/',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },

          body: JSON.stringify({
            full_name: fullName,
            phone: phone,
            address: address,
            city: city,
            pincode: pincode,
            payment_method: paymentMethod,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        onOrderPlaced(data)
      } else {
        setMessage(
          data.error || 'Unable to place order'
        )
      }
    } catch (error) {
      console.error(error)
      setMessage('Unable to connect to server')
    } finally {
      setPlacingOrder(false)
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
            ← Back to Cart
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="container py-5">

        <div className="mb-4">
          <h1 className="fw-bold">
            Checkout
          </h1>

          <p className="text-muted">
            Complete your delivery details and place your
            order.
          </p>
        </div>

        {message && (
          <div className="alert alert-danger">
            {message}

            <button
              className="btn-close float-end"
              onClick={() => setMessage('')}
            ></button>
          </div>
        )}

        <div className="row g-4">

          {/* DELIVERY FORM */}
          <div className="col-lg-7">

            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">

                <h4 className="fw-bold mb-4">
                  📍 Delivery Information
                </h4>

                <form onSubmit={placeOrder}>

                  {/* NAME */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Full Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) =>
                        setFullName(e.target.value)
                      }
                    />
                  </div>

                  {/* PHONE */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      className="form-control"
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          e.target.value.replace(/\D/g, '')
                        )
                      }
                    />
                  </div>

                  {/* ADDRESS */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Delivery Address
                    </label>

                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="House no, street, area"
                      value={address}
                      onChange={(e) =>
                        setAddress(e.target.value)
                      }
                    ></textarea>
                  </div>

                  <div className="row">

                    {/* CITY */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        City
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter city"
                        value={city}
                        onChange={(e) =>
                          setCity(e.target.value)
                        }
                      />
                    </div>

                    {/* PINCODE */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">
                        Pincode
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder="6-digit pincode"
                        maxLength="6"
                        value={pincode}
                        onChange={(e) =>
                          setPincode(
                            e.target.value.replace(/\D/g, '')
                          )
                        }
                      />
                    </div>

                  </div>

                  {/* PAYMENT */}
                  <div className="mb-4">

                    <label className="form-label fw-semibold">
                      Payment Method
                    </label>

                    <div className="border rounded p-3">

                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="payment"
                          value="Cash on Delivery"
                          checked={
                            paymentMethod ===
                            'Cash on Delivery'
                          }
                          onChange={(e) =>
                            setPaymentMethod(
                              e.target.value
                            )
                          }
                        />

                        <label className="form-check-label">
                          💵 Cash on Delivery
                        </label>
                      </div>

                    </div>

                  </div>

                  <button
                    type="submit"
                    className="btn btn-dark w-100"
                    disabled={placingOrder}
                  >
                    {placingOrder
                      ? 'Placing Order...'
                      : '🛍️ Place Order'}
                  </button>

                </form>

              </div>
            </div>

          </div>

          {/* ORDER SUMMARY */}
          <div className="col-lg-5">

            <div className="card border-0 shadow-sm">

              <div className="card-body p-4">

                <h4 className="fw-bold mb-4">
                  🧾 Order Summary
                </h4>

                {cart?.items?.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex justify-content-between mb-3"
                  >
                    <div>
                      <div className="fw-semibold">
                        {item.product_name}
                      </div>

                      <small className="text-muted">
                        Qty: {item.quantity}
                      </small>
                    </div>

                    <strong>
                      ₹
                      {(
                        Number(item.product_price) *
                        item.quantity
                      ).toFixed(2)}
                    </strong>
                  </div>
                ))}

                <hr />

                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>

                  <span>
                    ₹{getTotal().toFixed(2)}
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Delivery</span>

                  <span className="text-success">
                    Free
                  </span>
                </div>

                <hr />

                <div className="d-flex justify-content-between">
                  <strong className="fs-5">
                    Total
                  </strong>

                  <strong className="fs-5">
                    ₹{getTotal().toFixed(2)}
                  </strong>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default Checkout

