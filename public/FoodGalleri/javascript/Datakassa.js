import supabase from "./supabaseClient.js";

const currentUserId = window.currentUserId; // Passed from EJS in the script tag

// Load current open order for user
async function loadCart() {
  try {
    // Step 1: get the user's open order (status 'pending')
    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select("order_id")
      .eq("user_id", currentUserId)
      .eq("status", "pending")
      .limit(1);

    if (orderError) throw orderError;
    if (!orders.length) {
      showEmptyCart();
      return;
    }

    const orderId = orders[0].order_id;

    // Step 2: get order_items + meals info for that order
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        order_item_id,
        quantity,
        meals (
          name,
          price
        )
      `)
      .eq("order_id", orderId);

    if (itemsError) throw itemsError;
    if (!orderItems.length) {
      showEmptyCart();
      return;
    }

    renderCart(orderItems);
  } catch (error) {
    console.error("Error loading cart:", error);
  }
}

function showEmptyCart() {
  const cartContainer = document.getElementById("cartItems");
  cartContainer.innerHTML = "<p>Din varukorg är tom.</p>";
  document.getElementById("totalPrice").textContent = "0 kr";
}

function renderCart(orderItems) {
  const cartContainer = document.getElementById("cartItems");
  const totalDisplay = document.getElementById("totalPrice");
  cartContainer.innerHTML = "";

  let total = 0;

  orderItems.forEach((item) => {
    const itemTotal = item.quantity * item.meals.price;
    total += itemTotal;

    const itemDiv = document.createElement("div");
    itemDiv.className =
      "cart-item d-flex justify-content-between align-items-center border p-2 mb-2";

    itemDiv.innerHTML = `
      <div>
        <strong>${item.meals.name}</strong><br>
        ${item.quantity} x ${item.meals.price} kr
      </div>
      <div>
        ${itemTotal.toFixed(2)} kr
        <button class="btn btn-sm btn-danger ms-3" onclick="removeItem(${item.order_item_id})">Ta bort</button>
      </div>
    `;

    cartContainer.appendChild(itemDiv);
  });

  totalDisplay.textContent = `${total.toFixed(2)} kr`;
}

// Remove item from order_items table by order_item_id
window.removeItem = async function (order_item_id) {
  try {
    const { error } = await supabase
      .from("order_items")
      .delete()
      .eq("order_item_id", order_item_id);

    if (error) throw error;

    // Reload cart
    loadCart();
  } catch (error) {
    console.error("Error removing item:", error);
  }
};

// On purchase: update order status to 'completed' and alert success
window.buy = async function () {
  const address = document.getElementById("address").value.trim();
  if (!address) {
    alert("Ange en adress!");
    return;
  }

  try {
    // Get open order ID again
    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select("order_id")
      .eq("user_id", currentUserId)
      .eq("status", "pending")
      .limit(1);

    if (orderError) throw orderError;
    if (!orders.length) {
      alert("Inga öppna beställningar hittades.");
      return;
    }

    const orderId = orders[0].order_id;

    // Update order status to completed
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "completed", total_price: await calculateTotalPrice(orderId) })
      .eq("order_id", orderId);

    if (updateError) throw updateError;

    alert("Tack för ditt köp!");

    // Optionally reload cart (will be empty after completion)
    loadCart();
  } catch (error) {
    console.error("Error during purchase:", error);
  }
};

// Helper to calculate total price for an order
async function calculateTotalPrice(orderId) {
  const { data, error } = await supabase
    .from("order_items")
    .select("quantity, meals (price)")
    .eq("order_id", orderId);

  if (error) {
    console.error("Error calculating total price:", error);
    return 0;
  }

  return data.reduce((sum, item) => sum + item.quantity * item.meals.price, 0);
}

// Load cart on page load
loadCart();
