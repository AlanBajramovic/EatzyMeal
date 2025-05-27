import supabase from "./supabaseClient.js";

// This function sends selected meal items to the backend to place the order
export async function placeOrder(items) {
  try {
    const response = await fetch('/api/place-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items })
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.message || 'Order failed');
    alert('Order placed successfully!');
  } catch (err) {
    console.error('Order error:', err.message);
    alert('Order failed: ' + err.message);
  }
}
