
import { useEffect, useState } from 'react'

function Orders({ onBack }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    if (!token) {
      setMessage('Please login again.')
      setLoading(false)
      return
    }

    fetch('http://127.0.0.1:8000/api/orders/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async (response) => {
        const data = await response.json()

        console.log('Orders API status:', response.status)
        console.log('Orders API response:', data)

        if (!response.ok) {
          throw new Error(
            data.detail || 'Unable to load orders'
          )
        }

        return data
      })
      .then((data) => {
        setOrders(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Orders error:', error)
        setMessage(error.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h3>Loading orders...</h3>
      </div>
    )
  }

  return (
    <div className="container py-5">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2 className="fw-bold">
          📦 My Orders
        </h2>

        <button
          className="btn btn-outline-dark"
          onClick={onBack}
        >
          ← Continue Shopping
        </button>

      </div>

      {/* Error */}
      {message && (
        <div className="alert alert-danger">
          {message}
        </div>
      )}

      {/* Orders */}
      {orders.length === 0 ? (

        <div className="text-center py-5">

          <h3>
            No orders yet 📦
          </h3>

          <p className="text-muted">
            Your completed orders will appear here.
          </p>

          <button
            className="btn btn-dark mt-2"
            onClick={onBack}
          >
            Start Shopping
          </button>

        </div>

      ) : (

        <div className="row g-4">

          {orders.map((order) => (

            <div
              className="col-md-6"
              key={order.id}
            >

              <div className="card shadow-sm border-0 h-100">

                <div className="card-body p-4">

                  {/* Order Header */}
                  <div className="d-flex justify-content-between align-items-center">

                    <h5 className="fw-bold mb-0">
                      Order #{order.id}
                    </h5>

                    <span
                      className={`badge ${
                        order.status === 'Pending'
                          ? 'bg-warning text-dark'
                          : order.status === 'Delivered'
                          ? 'bg-success'
                          : order.status === 'Cancelled'
                          ? 'bg-danger'
                          : 'bg-primary'
                      }`}
                    >
                      {order.status}
                    </span>

                  </div>

                  <hr />

                  {/* Products */}
                  <h6 className="fw-bold mb-3">
                    🛍️ Products
                  </h6>

                  {order.items.map((item) => (

                    <div
                      className="d-flex justify-content-between mb-3"
                      key={item.id}
                    >

                      <div>

                        <strong>
                          {item.product_name}
                        </strong>

                        <div className="text-muted small">
                          Quantity: {item.quantity}
                        </div>

                      </div>

                      <strong>
                        ₹{item.price}
                      </strong>

                    </div>

                  ))}

                  <hr />

                  {/* Delivery Information */}
                  <h6 className="fw-bold mb-3">
                    📍 Delivery Information
                  </h6>

                  <div className="small">

                    <div className="mb-2">
                      <span className="text-muted">
                        Name:
                      </span>{' '}
                      <strong>
                        {order.full_name || 'Not provided'}
                      </strong>
                    </div>

                    <div className="mb-2">
                      <span className="text-muted">
                        Phone:
                      </span>{' '}
                      <strong>
                        {order.phone || 'Not provided'}
                      </strong>
                    </div>

                    <div className="mb-2">
                      <span className="text-muted">
                        Address:
                      </span>{' '}
                      <strong>
                        {order.address || 'Not provided'}
                      </strong>
                    </div>

                    <div className="mb-2">
                      <span className="text-muted">
                        City:
                      </span>{' '}
                      <strong>
                        {order.city || 'Not provided'}
                      </strong>
                    </div>

                    <div className="mb-2">
                      <span className="text-muted">
                        Pincode:
                      </span>{' '}
                      <strong>
                        {order.pincode || 'Not provided'}
                      </strong>
                    </div>

                    <div className="mb-2">
                      <span className="text-muted">
                        Payment:
                      </span>{' '}
                      <strong>
                        💵 {order.payment_method}
                      </strong>
                    </div>

                  </div>

                  <hr />

                  {/* Date */}
                  <div className="d-flex justify-content-between">

                    <span className="text-muted">
                      Order Date
                    </span>

                    <span>
                      {new Date(
                        order.created_at
                      ).toLocaleDateString()}
                    </span>

                  </div>

                  {/* Total */}
                  <div className="d-flex justify-content-between mt-2">

                    <strong>
                      Total
                    </strong>

                    <strong className="fs-5">
                      ₹{order.total_amount}
                    </strong>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  )
}

export default Orders

