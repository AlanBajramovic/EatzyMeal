import supabase from "./supabaseClient.js";

const user_id = window.currentUserId;

if (!user_id) {
  console.error("User ID is missing.");
}

async function loadCart() {
  try {
    // 1. Get user's latest pending order
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('order_id')
      .eq('user_id', user_id)
      .eq('status', 'pending')
      .order('order_date', { ascending: false })
      .limit(1);

    if (orderError) throw orderError;
    if (!orders || orders.length === 0) {
      showEmptyCart();
      return;
    }

    const orderId = orders[0].order_id;

    // 2. Get order items with meal info
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        order_item_id,
        quantity,
        meals (
          name,
          price
        )
      `)
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    if (!items || items.length === 0) {
      showEmptyCart();
    } else {
      renderCart(items);
    }

  } catch (err) {
    console.error("Error loading cart:", err);
    showEmptyCart();
  }
}

function showEmptyCart() {
  document.getElementById("cartItems").innerHTML = "<p>Din varukorg är tom.</p>";
  document.getElementById("totalPrice").textContent = "0 kr";
}

function renderCart(items) {
  const cartContainer = document.getElementById("cartItems");
  const totalDisplay = document.getElementById("totalPrice");

  cartContainer.innerHTML = "";
  let total = 0;

  items.forEach(item => {
    const itemPrice = item.meals.price;
    const itemTotal = item.quantity * itemPrice;
    total += itemTotal;

    const div = document.createElement("div");
    div.className = "cart-item d-flex justify-content-between align-items-center border p-2 mb-2";
    div.innerHTML = `
      <div>
        <strong>${item.meals.name}</strong><br>
        ${item.quantity} x ${itemPrice.toFixed(2)} kr
      </div>
      <div>
        ${itemTotal.toFixed(2)} kr
        <button class="btn btn-sm btn-danger ms-3" onclick="removeItem(${item.order_item_id})">Ta bort</button>
      </div>
    `;
    cartContainer.appendChild(div);
  });

  totalDisplay.textContent = `${total.toFixed(2)} kr`;
}

window.removeItem = async function(order_item_id) {
  try {
    const { error } = await supabase
      .from('order_items')
      .delete()
      .eq('order_item_id', order_item_id);

    if (error) throw error;
    loadCart();
  } catch (err) {
    console.error("Error removing item:", err);
  }
};

loadCart();
