# Brew & Bean Coffee Shop Website

A responsive coffee shop landing page built with HTML5, CSS3, Bootstrap 5.3, Bootstrap Icons, and vanilla JavaScript.

## Run locally
1. Clone the repository:
   ```bash
   git clone https://github.com/Astrionix/Brew-and-Bean.git
   cd Brew-and-Bean
   ```
2. Open `brew_and_bean/index.html` in your browser (or use VS Code Live Server / Python `python -m http.server 3000 --directory brew_and_bean`).
3. An internet connection is required for Bootstrap, Bootstrap Icons, Google Fonts, and Unsplash images.

## Features
- **Responsive Navigation:** Scroll-tracking (ScrollSpy) and smooth scrolling across all sections.
- **Hero Showcase:** Carefully balanced typography, aesthetic photography, and neighborly storytelling.
- **Menu Filtering:** Fast category filtering with CSS fade transitions across Coffee, Cold drinks, and Bakery & bites.
- **Interactive Cart:** Quantity controls (`+` / `−`), line remove, clear bag, and persistent cart storage via `localStorage`.
- **Checkout Modal & Order Receipt:** Itemized breakdown (subtotal + 5% GST), customer pickup form, and real-time order confirmation receipt with generated order numbers and estimated pickup times.
- **Live Notifications:** Bootstrap Toast notifications and bounce animations on cart badges.
- **Contact Form:** Front-end validation with responsive feedback banner.
- **Mobile-Friendly:** Automatically collapsing mobile drawer and touch-optimized navigation.

## Notes
The cart and contact form are front-end demonstrations. Connect a backend (Node.js/Python/Go) and payment provider (Stripe/Razorpay) to receive real orders or enquiries.
