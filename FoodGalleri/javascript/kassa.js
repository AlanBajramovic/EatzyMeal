// checkout.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient('https://your-project-id.supabase.co', 'your-anon-key');

// Get current user
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  alert("You must be logged in to view your cart.");
  // Optionally redirect to login
  // window.location.href = "/login.html";
}

const cartContainer = document.getElementById('cartItems');
const totalPriceEl = document.getElementById('totalPrice');

// Get user's cart
const { data: cart, error } = await supabase
  .from('cart_items')
  .select('id, quantity, menu_items(namn, pris)')
  .eq('user_id', user.id);

if (error) {
  console.error('Could not load cart:', error);
} else {
  let total = 0;
  cart.forEach(item => {
    const name = item.menu_items.namn;
    const price = item.menu_items.pris;
    const qty = item.quantity;
    const subtotal = price * qty;
    total += subtotal;

    const itemDiv = document.createElement('div');
    itemDiv.innerHTML = `
      <p>
        ${name} - ${price} kr x 
        <input type="number" min="1" value="${qty}" data-id="${item.id}" class="qty-input" /> = ${subtotal} kr
        <button class="delete-btn" data-id="${item.id}">🗑️</button>
      </p>
    `;
    cartContainer.appendChild(itemDiv);
  });

  totalPriceEl.textContent = `${total.toFixed(2)} kr`;
}

// Handle quantity update
document.addEventListener('change', async (e) => {
  if (e.target.classList.contains('qty-input')) {
    const id = e.target.dataset.id;
    const newQty = parseInt(e.target.value);
    await supabase.from('cart_items').update({ quantity: newQty }).eq('id', id);
    location.reload(); // Refresh to update total
  }
});

// Handle delete
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.dataset.id;
    await supabase.from('cart_items').delete().eq('id', id);
    location.reload();
  }
});
