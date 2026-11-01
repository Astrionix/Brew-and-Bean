// Cart State Management with LocalStorage
const CART_STORAGE_KEY = "brew_and_bean_cart";
let cart = [];

try {
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
} catch (e) {
  cart = [];
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    // Ignore localStorage write error if disabled
  }
}

// Current Year in footer
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Toast Notification Helper
function showToast(message) {
  const toastEl = document.getElementById("cartToast");
  const toastMsg = document.getElementById("toastMessage");
  if (!toastEl || !toastMsg) return;

  toastMsg.textContent = message;
  const toastInstance = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2600 });
  toastInstance.show();
}

// Trigger bounce animation on cart badges
function animateCartBadges() {
  const badges = [
    document.getElementById("cartButton"),
    document.getElementById("navCartCount")
  ];
  badges.forEach((el) => {
    if (!el) return;
    el.classList.remove("bounce-animate");
    // force reflow
    void el.offsetWidth;
    el.classList.add("bounce-animate");
  });
}

// Menu Filtering with Accessible Attributes & Transitions
document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    const filter = button.dataset.filter;
    document.querySelectorAll(".menu-item").forEach((item) => {
      const match = filter === "all" || item.dataset.category === filter;
      if (match) {
        item.classList.remove("d-none");
        item.style.animation = "none";
        void item.offsetWidth;
        item.style.animation = "fadeIn 0.3s ease";
      } else {
        item.classList.add("d-none");
      }
    });
  });
});

// Safe "Add to order" handler (fixes race condition from rapid clicks)
document.querySelectorAll(".add-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);

    const existing = cart.find((item) => item.name === name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1 });
    }

    saveCart();
    renderCart();
    animateCartBadges();
    showToast(`Added ${name} to your order`);

    // Reset button feedback safely without string destruction
    clearTimeout(button._resetTimer);
    button.innerHTML = 'Added <i class="bi bi-check-circle-fill"></i>';
    button.classList.add("btn-added");

    button._resetTimer = setTimeout(() => {
      button.innerHTML = 'Add to order <i class="bi bi-plus-circle"></i>';
      button.classList.remove("btn-added");
    }, 900);
  });
});

// Quantity controls
function changeItemQuantity(index, delta) {
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  renderCart();
}

function removeCartItem(index) {
  if (!cart[index]) return;
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

// Render Cart UI
function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  // Badges and counts
  const cartCountEl = document.getElementById("cartCount");
  const navCartCountEl = document.getElementById("navCartCount");
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const cartTaxEl = document.getElementById("cartTax");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartItemCountLabel = document.getElementById("cartItemCountLabel");

  if (cartCountEl) cartCountEl.textContent = count;
  if (navCartCountEl) navCartCountEl.textContent = count;
  if (cartSubtotalEl) cartSubtotalEl.textContent = `₹${subtotal.toLocaleString("en-IN")}`;
  if (cartTaxEl) cartTaxEl.textContent = `₹${tax.toLocaleString("en-IN")}`;
  if (cartTotalEl) cartTotalEl.textContent = `₹${total.toLocaleString("en-IN")}`;
  if (cartItemCountLabel) {
    cartItemCountLabel.textContent = count === 1 ? "1 item" : `${count} items`;
  }

  const cartItemsContainer = document.getElementById("cartItems");
  const checkoutBtn = document.getElementById("checkoutButton");
  const clearBtn = document.getElementById("clearCartBtn");

  if (!cart.length) {
    cartItemsContainer.innerHTML = '<p class="empty-cart"><i class="bi bi-cup-hot fs-1 d-block mb-3 opacity-25"></i>Your bag is waiting for something lovely.</p>';
    if (checkoutBtn) checkoutBtn.disabled = true;
    if (clearBtn) clearBtn.classList.add("d-none");
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;
  if (clearBtn) clearBtn.classList.remove("d-none");

  cartItemsContainer.innerHTML = cart
    .map(
      (item, index) => `
    <div class="cart-line">
      <div class="cart-line-info">
        <span class="cart-line-name">${escapeHTML(item.name)}</span>
        <span class="cart-line-rate">₹${item.price.toLocaleString("en-IN")} each</span>
        <div class="cart-qty-ctrl">
          <button type="button" class="btn-qty" data-decrease="${index}" aria-label="Decrease quantity for ${escapeHTML(item.name)}">−</button>
          <span class="cart-qty-num">${item.quantity}</span>
          <button type="button" class="btn-qty" data-increase="${index}" aria-label="Increase quantity for ${escapeHTML(item.name)}">+</button>
        </div>
      </div>
      <div class="cart-line-actions">
        <span class="cart-line-price">₹${(item.price * item.quantity).toLocaleString("en-IN")}</span>
        <button type="button" class="btn-remove-item" data-remove="${index}" aria-label="Remove ${escapeHTML(item.name)}">Remove</button>
      </div>
    </div>`
    )
    .join("");

  // Attach dynamic event listeners inside cart
  cartItemsContainer.querySelectorAll("[data-increase]").forEach((btn) => {
    btn.addEventListener("click", () => changeItemQuantity(Number(btn.dataset.increase), 1));
  });

  cartItemsContainer.querySelectorAll("[data-decrease]").forEach((btn) => {
    btn.addEventListener("click", () => changeItemQuantity(Number(btn.dataset.decrease), -1));
  });

  cartItemsContainer.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => removeCartItem(Number(btn.dataset.remove)));
  });
}

// Clear cart button listener
const clearCartBtn = document.getElementById("clearCartBtn");
if (clearCartBtn) {
  clearCartBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your coffee bag?")) {
      clearCart();
    }
  });
}

// Helper to escape HTML safely
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

// Interactive Checkout Modal
const checkoutBtn = document.getElementById("checkoutButton");
const checkoutModalEl = document.getElementById("checkoutModal");

if (checkoutBtn && checkoutModalEl) {
  checkoutBtn.addEventListener("click", () => {
    if (!cart.length) {
      showToast("Please add an item to your bag first!");
      return;
    }

    // Hide cart offcanvas
    const offcanvasEl = document.getElementById("cartPanel");
    if (offcanvasEl) {
      bootstrap.Offcanvas.getInstance(offcanvasEl)?.hide();
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    const modalBody = document.getElementById("checkoutModalBody");
    modalBody.innerHTML = `
      <div class="order-modal-summary">
        <h6 class="fw-bold mb-3 text-coffee"><i class="bi bi-receipt me-2"></i>Order Summary</h6>
        ${cart
          .map(
            (item) => `
          <div class="modal-order-row">
            <span>${escapeHTML(item.name)} × ${item.quantity}</span>
            <strong>₹${(item.price * item.quantity).toLocaleString("en-IN")}</strong>
          </div>`
          )
          .join("")}
        <div class="modal-order-row mt-2 pt-2 border-top">
          <span>Subtotal</span>
          <span>₹${subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div class="modal-order-row">
          <span>GST (5%)</span>
          <span>₹${tax.toLocaleString("en-IN")}</span>
        </div>
        <div class="modal-order-row fw-bold text-coffee fs-6 pt-1">
          <span>Grand Total</span>
          <span>₹${total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <form id="demoCheckoutForm">
        <div class="mb-3">
          <label class="form-label" for="custName">Pickup Name</label>
          <input type="text" class="form-control" id="custName" placeholder="e.g. Maya Sharma" required>
        </div>
        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="form-label" for="orderType">Type</label>
            <select class="form-control" id="orderType">
              <option value="Dine-in">Dine-in</option>
              <option value="Takeaway" selected>Takeaway</option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label" for="tableNo">Table / Contact</label>
            <input type="text" class="form-control" id="tableNo" placeholder="Table # or Phone" required>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="orderNotes">Barista Notes (Optional)</label>
          <input type="text" class="form-control" id="orderNotes" placeholder="e.g. extra oat milk, less ice">
        </div>
        <button type="submit" class="btn btn-coffee w-100 py-2 fs-6" id="submitOrderBtn">
          Place Demo Order · ₹${total.toLocaleString("en-IN")}
        </button>
      </form>
    `;

    const checkoutModal = new bootstrap.Modal(checkoutModalEl);
    checkoutModal.show();

    // Attach order placement handler
    document.getElementById("demoCheckoutForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const custName = document.getElementById("custName").value.trim();
      const orderType = document.getElementById("orderType").value;
      const orderId = `BB-${Math.floor(1000 + Math.random() * 9000)}`;

      const submitBtn = document.getElementById("submitOrderBtn");
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Preparing order...';

      setTimeout(() => {
        modalBody.innerHTML = `
          <div class="text-center py-3">
            <div class="order-success-icon"><i class="bi bi-check2-circle"></i></div>
            <h4 class="font-serif fw-bold text-coffee mb-2">Order Confirmed!</h4>
            <p class="text-muted mb-3">Thank you, <strong>${escapeHTML(custName)}</strong>. Your order is being freshly brewed.</p>
            <div class="bg-light p-3 rounded mb-4 text-start">
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted small">Order Number:</span>
                <strong>#${orderId}</strong>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted small">Type:</span>
                <span>${escapeHTML(orderType)}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted small">Estimated Pickup:</span>
                <strong class="text-success"><i class="bi bi-clock me-1"></i>12 – 15 minutes</strong>
              </div>
            </div>
            <button type="button" class="btn btn-coffee w-100" data-bs-dismiss="modal">Done & Enjoy Coffee</button>
          </div>
        `;
        clearCart();
        showToast(`Order #${orderId} confirmed!`);
      }, 700);
    });
  });
}

// Contact form handling with feedback banner
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const alertBox = document.getElementById("formSuccessAlert");
    const alertText = document.getElementById("formSuccessText");

    if (alertBox && alertText) {
      alertText.textContent = `Thanks, ${name}! Your note has reached us. We'll reply to your email shortly!`;
      alertBox.classList.remove("d-none");
    }

    contactForm.reset();

    // Auto fade after 7s
    setTimeout(() => {
      if (alertBox) alertBox.classList.add("d-none");
    }, 7000);
  });
}

// Close mobile navigation drawer when ANY link inside is clicked
document.querySelectorAll("#mainNav a, #mainNav button").forEach((element) => {
  element.addEventListener("click", () => {
    const nav = document.getElementById("mainNav");
    if (nav && nav.classList.contains("show")) {
      bootstrap.Collapse.getOrCreateInstance(nav).hide();
    }
  });
});

// Active Navbar link on scroll (IntersectionObserver)
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll("#mainNav .nav-link");

if ("IntersectionObserver" in window && sections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        }
      });
    },
    {
      rootMargin: "-25% 0px -65% 0px"
    }
  );

  sections.forEach((sec) => observer.observe(sec));
}

// Initial cart render on page load
renderCart();
