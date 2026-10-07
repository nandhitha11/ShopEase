import ProductDetails from './ProductDetails'
import { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from './Login'
import Cart from './Cart'
import Orders from './Orders'
import Wishlist from './Wishlist'

function App() {
const [isLoggedIn, setIsLoggedIn] = useState(
Boolean(localStorage.getItem('accessToken'))
)

const [products, setProducts] = useState([])
const [filteredProducts, setFilteredProducts] = useState([])
const [message, setMessage] = useState('')

const [showCart, setShowCart] = useState(false)
const [showOrders, setShowOrders] = useState(false)
const [showWishlist, setShowWishlist] = useState(false)

const [search, setSearch] = useState('')
const [selectedCategory, setSelectedCategory] = useState('All')
const [selectedProduct, setSelectedProduct] = useState(null)

// OFFERS
const [offersOnly, setOffersOnly] = useState(false)

// WISHLIST
const [wishlist, setWishlist] = useState([])

// LOAD PRODUCTS
useEffect(() => {
if (!isLoggedIn) return


const token = localStorage.getItem('accessToken')

fetch('http://127.0.0.1:8000/api/products/', {
  headers: {
    Authorization: 'Bearer ' + token,
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error('Unable to load products')
    }

    return response.json()
  })
  .then((data) => {
    console.log('PRODUCT DATA:', data)

    setProducts(data)
    setFilteredProducts(data)
  })
  .catch((error) => {
    console.error(error)
    setMessage('❌ Unable to load products')
  })


}, [isLoggedIn])

// LOAD WISHLIST
useEffect(() => {
if (!isLoggedIn) return


const token = localStorage.getItem('accessToken')

fetch('http://127.0.0.1:8000/api/wishlist/', {
  headers: {
    Authorization: 'Bearer ' + token,
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error('Unable to load wishlist')
    }

    return response.json()
  })
  .then((data) => {
    console.log('WISHLIST DATA:', data)
    setWishlist(data)
  })
  .catch((error) => {
    console.error(error)
  })


}, [isLoggedIn])

// GET DISCOUNT
const getDiscount = (product) => {
if (
product.discount !== undefined &&
product.discount !== null
) {
return Number(product.discount)
}


return 0


}

// SEARCH + CATEGORY + OFFERS FILTER
useEffect(() => {
let result = [...products]


// CATEGORY
if (selectedCategory !== 'All') {
  result = result.filter(
    (product) =>
      product.category?.name === selectedCategory
  )
}

// OFFERS
if (offersOnly) {
  result = result.filter(
    (product) => getDiscount(product) > 0
  )
}

// SEARCH
if (search.trim() !== '') {
  const searchText = search.toLowerCase().trim()

  result = result.filter(
    (product) =>
      product.name
        ?.toLowerCase()
        .includes(searchText) ||
      product.description
        ?.toLowerCase()
        .includes(searchText) ||
      product.category?.name
        ?.toLowerCase()
        .includes(searchText)
  )
}

setFilteredProducts(result)


}, [
search,
selectedCategory,
products,
offersOnly,
])

// ADD TO CART
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
    setMessage(
      '✅ Product added to cart successfully!'
    )
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

// CHECK WISHLIST
const isWishlisted = (productId) => {
return wishlist.some(
(item) => item.product === productId
)
}

// TOGGLE WISHLIST
const toggleWishlist = async (productId) => {
const token = localStorage.getItem('accessToken')


const alreadyWishlisted =
  isWishlisted(productId)

try {
  if (alreadyWishlisted) {
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
          (data.error ||
            'Unable to remove from wishlist')
      )
    }
  } else {
    const response = await fetch(
      'http://127.0.0.1:8000/api/wishlist/add/',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },

        body: JSON.stringify({
          product: productId,
        }),
      }
    )

    const data = await response.json()

    if (response.ok) {
      const wishlistResponse = await fetch(
        'http://127.0.0.1:8000/api/wishlist/',
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      )

      const wishlistData =
        await wishlistResponse.json()

      setWishlist(wishlistData)

      setMessage('❤️ Added to wishlist')
    } else {
      setMessage(
        '❌ ' +
          (data.error ||
            'Unable to add to wishlist')
      )
    }
  }
} catch (error) {
  console.error(error)
  setMessage('❌ Unable to connect to server')
}


}

// LOGOUT
const logout = () => {
localStorage.removeItem('accessToken')
localStorage.removeItem('refreshToken')


setWishlist([])
setIsLoggedIn(false)


}

// PRODUCT ICON
const getProductIcon = (category) => {
switch (category) {
case 'Fashion':
return '👕'


  case 'Beauty':
    return '🧴'

  case 'Home & Kitchen':
    return '☕'

  case 'Accessories':
    return '🕶️'

  case 'Mobiles':
    return '📱'

  case 'Laptops':
    return '💻'

  case 'Electronics':
    return '🎧'

  default:
    return '🛍️'
}


}

// RATING
const getRating = (product) => {
if (
product.rating !== undefined &&
product.rating !== null
) {
return Number(product.rating)
}


return 4.5


}

// ORIGINAL PRICE
const calculateOriginalPrice = (
price,
discount
) => {
if (!discount || discount <= 0) {
return null
}


return Math.round(
  Number(price) / (1 - discount / 100)
)


}

// LOGIN
if (!isLoggedIn) {
return (
<Login
onLogin={() => setIsLoggedIn(true)}
/>
)
}

// CART
if (showCart) {
return (
<Cart
onBack={() => setShowCart(false)}
/>
)
}

// ORDERS
if (showOrders) {
return (
<Orders
onBack={() => setShowOrders(false)}
/>
)
}

// WISHLIST
if (showWishlist) {
return (
<Wishlist
onBack={() => setShowWishlist(false)}
/>
)
}

// PRODUCT DETAILS
if (selectedProduct) {
return (
<ProductDetails
product={selectedProduct}
onBack={() =>
setSelectedProduct(null)
}
/>
)
}

return ( <div>
{/* NAVBAR */} <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top"> <div className="container">

```
      <a
        className="navbar-brand fw-bold"
        href="#"
        onClick={(e) => {
          e.preventDefault()

          setSelectedCategory('All')
          setSearch('')
          setOffersOnly(false)
        }}
      >
        🛍️ ShopEase
      </a>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div
        className="collapse navbar-collapse"
        id="navbarContent"
      >
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">

          {/* HOME */}
          <li className="nav-item">
            <button
              className="nav-link btn btn-link text-white"
              onClick={() => {
                setSelectedCategory('All')
                setSearch('')
                setOffersOnly(false)
              }}
            >
              Home
            </button>
          </li>

          {/* CATEGORIES */}
          <li className="nav-item dropdown">

            <button
              className="nav-link dropdown-toggle btn btn-link text-white"
              data-bs-toggle="dropdown"
            >
              Categories
            </button>

            <ul className="dropdown-menu">

              <li>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedCategory('All')
                    setOffersOnly(false)
                  }}
                >
                  All Products
                </button>
              </li>

              <li>
                <hr className="dropdown-divider" />
              </li>

              {[
                'Electronics',
                'Fashion',
                'Beauty',
                'Home & Kitchen',
                'Accessories',
                'Mobiles',
                'Laptops',
              ].map((category) => (
                <li key={category}>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedCategory(category)
                      setOffersOnly(false)
                    }}
                  >
                    {category}
                  </button>
                </li>
              ))}

            </ul>
          </li>

          {/* OFFERS */}
          <li className="nav-item">
            <button
              className={`nav-link btn btn-link ${
                offersOnly
                  ? 'text-warning fw-bold'
                  : 'text-white'
              }`}
              onClick={() => {
                setOffersOnly(true)
                setSearch('')
                setSelectedCategory('All')
                setMessage('')
              }}
            >
              🔥 Offers
            </button>
          </li>

        </ul>

        {/* SEARCH */}
        <form
          className="d-flex me-3"
          onSubmit={(e) =>
            e.preventDefault()
          }
        >
          <input
            className="form-control"
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </form>

        {/* ACTION BUTTONS */}
        <div className="d-flex gap-2">

          {/* WISHLIST */}
          <button
            className="btn btn-outline-light"
            onClick={() =>
              setShowWishlist(true)
            }
          >
            ❤️ {wishlist.length}
          </button>

          {/* CART */}
          <button
            className="btn btn-outline-light"
            onClick={() =>
              setShowCart(true)
            }
          >
            🛒 Cart
          </button>

          {/* ORDERS */}
          <button
            className="btn btn-outline-light"
            onClick={() =>
              setShowOrders(true)
            }
          >
            📦 Orders
          </button>

          {/* LOGOUT */}
          <button
            className="btn btn-outline-light"
            onClick={logout}
          >
            Logout
          </button>

        </div>
      </div>
    </div>
  </nav>

  {/* HERO */}
  <section className="bg-light py-5">
    <div className="container">

      <div className="row align-items-center">

        <div className="col-md-7">

          <span className="badge bg-dark mb-3">
            {offersOnly
              ? '🔥 Special Offers'
              : 'Welcome to ShopEase'}
          </span>

          <h1 className="display-4 fw-bold">

            {offersOnly ? (
              <>
                Great Deals,
                <br />
                Better Prices.
              </>
            ) : (
              <>
                Everything You Need,
                <br />
                All in One Place.
              </>
            )}

          </h1>

          <p className="lead text-muted mt-3">
            {offersOnly
              ? 'Grab amazing deals and save more on your favorite products.'
              : 'Discover amazing products at great prices. Shop electronics, fashion, beauty products and more.'}
          </p>

          <button
            className="btn btn-dark btn-lg mt-2"
            onClick={() => {
              setSelectedCategory('All')
              setSearch('')
              setOffersOnly(false)
            }}
          >
            {offersOnly
              ? 'View All Products →'
              : 'Shop Now →'}
          </button>

        </div>

        <div className="col-md-5 text-center mt-4 mt-md-0">

          <div
            className="bg-white rounded shadow-sm p-5"
            style={{
              fontSize: '100px',
            }}
          >
            {offersOnly
              ? '🔥'
              : '🛍️'}
          </div>

        </div>

      </div>
    </div>
  </section>

  {/* PRODUCTS */}
  <section className="py-5">

    <div className="container">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">

            {offersOnly
              ? '🔥 Special Offers'
              : selectedCategory === 'All'
              ? 'All Products'
              : selectedCategory}

          </h2>

          <p className="text-muted mb-0">

            {filteredProducts.length}{' '}
            {filteredProducts.length === 1
              ? 'product'
              : 'products'}{' '}
            found

          </p>

        </div>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="alert alert-info text-center">

          {message}

          <button
            className="btn-close float-end"
            onClick={() =>
              setMessage('')
            }
          ></button>

        </div>
      )}

      {/* EMPTY STATE */}
      {filteredProducts.length === 0 ? (

        <div className="text-center py-5">

          <div
            style={{
              fontSize: '60px',
            }}
          >
            {offersOnly
              ? '🔥'
              : '🔍'}
          </div>

          <h4>
            {offersOnly
              ? 'No offers available'
              : 'No products found'}
          </h4>

          <p className="text-muted">
            {offersOnly
              ? 'Check back later for exciting deals.'
              : 'Try another search or category.'}
          </p>

          {offersOnly && (
            <button
              className="btn btn-dark mt-2"
              onClick={() => {
                setOffersOnly(false)
                setSelectedCategory('All')
                setSearch('')
              }}
            >
              View All Products
            </button>
          )}

        </div>

      ) : (

        <div className="row g-4">

          {filteredProducts.map((product) => {

            const discount =
              getDiscount(product)

            const rating =
              getRating(product)

            const originalPrice =
              calculateOriginalPrice(
                product.price,
                discount
              )

            const productIsWishlisted =
              isWishlisted(product.id)

            return (

              <div
                className="col-sm-6 col-md-4 col-lg-3"
                key={product.id}
              >

                <div
                  className="card h-100 border-0 shadow-sm"
                  onClick={() =>
                    setSelectedProduct(product)
                  }
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: '0.3s',
                    cursor: 'pointer',
                  }}
                >

                  {/* PRODUCT IMAGE */}
                  <div
                    className="bg-light position-relative d-flex align-items-center justify-content-center"
                    style={{
                      height: '220px',
                      overflow: 'hidden',
                    }}
                  >

                    {/* WISHLIST */}
                    <button
                      className="btn btn-light position-absolute top-0 end-0 m-3 shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleWishlist(
                          product.id
                        )
                      }}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        padding: '0',
                        fontSize: '20px',
                        zIndex: 3,
                      }}
                      title={
                        productIsWishlisted
                          ? 'Remove from wishlist'
                          : 'Add to wishlist'
                      }
                    >
                      {productIsWishlisted
                        ? '❤️'
                        : '🤍'}
                    </button>

                    {/* DISCOUNT */}
                    {discount > 0 && (
                      <span
                        className="badge bg-danger position-absolute top-0 start-0 m-3"
                        style={{
                          fontSize: '12px',
                          padding: '7px 10px',
                          zIndex: 2,
                        }}
                      >
                        {discount}% OFF
                      </span>
                    )}

                    {/* OUT OF STOCK */}
                    {product.stock === 0 && (
                      <span
                        className="badge bg-dark position-absolute bottom-0 start-0 m-3"
                        style={{
                          zIndex: 2,
                          padding: '7px 10px',
                        }}
                      >
                        OUT OF STOCK
                      </span>
                    )}

                    {/* IMAGE */}
                    {product.image ? (

                      <img
                        src={product.image}
                        alt={product.name}
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
                        {getProductIcon(
                          product.category?.name
                        )}
                      </span>

                    )}

                  </div>

                  {/* PRODUCT DETAILS */}
                  <div className="card-body d-flex flex-column">

                    <small className="text-muted">
                      {product.category?.name ||
                        'Product'}
                    </small>

                    <h5
                      className="fw-bold mt-1 mb-2"
                      style={{
                        minHeight: '48px',
                      }}
                    >
                      {product.name}
                    </h5>

                    {/* RATING */}
                    <div className="mb-2">

                      <span className="text-warning">
                        {'★'.repeat(
                          Math.floor(rating)
                        )}
                      </span>

                      <span className="text-secondary">
                        {'★'.repeat(
                          5 -
                            Math.floor(rating)
                        )}
                      </span>

                      <small className="text-muted ms-2">
                        {rating.toFixed(1)}
                      </small>

                    </div>

                    {/* DESCRIPTION */}
                    <p
                      className="text-muted small mb-3"
                      style={{
                        minHeight: '40px',
                      }}
                    >
                      {product.description}
                    </p>

                    {/* PRICE */}
                    <div className="mb-2">

                      <span className="fw-bold fs-5">
                        ₹{product.price}
                      </span>

                      {originalPrice && (
                        <span
                          className="text-muted ms-2"
                          style={{
                            textDecoration:
                              'line-through',
                            fontSize: '14px',
                          }}
                        >
                          ₹{originalPrice}
                        </span>
                      )}

                    </div>

                    {/* STOCK */}
                    <small
                      className={
                        product.stock > 0
                          ? 'text-success fw-semibold mb-3'
                          : 'text-danger fw-semibold mb-3'
                      }
                    >
                      {product.stock > 0
                        ? `✓ ${product.stock} items available`
                        : '✕ Out of stock'}
                    </small>

                    {/* ADD TO CART */}
                    <button
                      className="btn btn-dark w-100 mt-auto"
                      disabled={
                        product.stock === 0
                      }
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart(product.id)
                      }}
                      style={{
                        borderRadius: '8px',
                        padding: '10px',
                      }}
                    >
                      {product.stock === 0
                        ? 'Out of Stock'
                        : '🛒 Add to Cart'}
                    </button>

                  </div>
                </div>
              </div>
            )
          })}

        </div>
      )}

    </div>
  </section>

  {/* FOOTER */}
  <footer className="bg-dark text-white py-5">

    <div className="container">

      <div className="row">

        <div className="col-md-4">

          <h4 className="fw-bold">
            🛍️ ShopEase
          </h4>

          <p className="text-light">
            Your one-stop destination for quality
            products at great prices.
          </p>

        </div>

        <div className="col-md-4">

          <h5>Quick Links</h5>

          <p
            className="mb-1"
            role="button"
            onClick={() => {
              setSelectedCategory('All')
              setSearch('')
              setOffersOnly(false)
              window.scrollTo(0, 0)
            }}
          >
            Home
          </p>

          <p className="mb-1">
            Categories
          </p>

          <p
            className="mb-1"
            role="button"
            onClick={() => {
              setOffersOnly(true)
              setSelectedCategory('All')
              setSearch('')
              window.scrollTo(0, 0)
            }}
          >
            Offers
          </p>

        </div>

        <div className="col-md-4">

          <h5>Customer Service</h5>

          <p
            className="mb-1"
            role="button"
            onClick={() =>
              setShowOrders(true)
            }
          >
            📦 Track Order
          </p>

          <p
            className="mb-1"
            role="button"
            onClick={() =>
              setShowCart(true)
            }
          >
            🛒 Shopping Cart
          </p>

          <p className="mb-1">
            📞 Contact Us
          </p>

        </div>

      </div>

      <hr />

      <p className="text-center mb-0">
        © 2026 ShopEase. All rights reserved.
      </p>

    </div>
  </footer>

</div>


)
}

export default App
