import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient('https://bupuawehdwgqgstylfzy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1cHVhd2VoZHdncWdzdHlsZnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MzkxNTQsImV4cCI6MjA2MjExNTE1NH0.W8yf7BOXJuYDhElohu0S_3DV6S8h1tJNye2Rc1L3z-w');

// Get current user
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  alert("You must be logged in to view your cart.");
  // Optionally redirect to login
  // window.location.href = "/login.html";
}

const cartContainer = document.getElementById('orders');
const totalPriceEl = document.getElementById('totalPrice');

// Get user's cart
const { data: cart, error } = await supabase
  .from('orders')
  .select('id, quantity, meals(namn, pris)')
  .eq('user_id', user.id);

if (error) {
  console.error('Could not load cart:', error);
} else {
  let total = 0;
  cart.forEach(item => {
    const name = item.meals.namn;
    const price = item.meals.pris;
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
    await supabase.from('orders').update({ quantity: newQty }).eq('id', id);
    location.reload(); // Refresh to update total
  }
});

// Handle delete
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.dataset.id;
    await supabase.from('orders').delete().eq('id', id);
    location.reload();
  }
});
