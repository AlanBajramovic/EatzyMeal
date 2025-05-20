const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
require('dotenv').config();

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Get logged-in user
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
alert("You must be logged in to add items to the cart.");
// Optionally redirect to login page
// window.location.href = '/login.html';
return;
}

// Attach event listeners to all add-to-cart buttons
document.querySelectorAll('.addToCartBtn').forEach(btn => {
btn.addEventListener('click', async () => {
    const itemId = parseInt(btn.dataset.id);
    const itemName = btn.dataset.name;
    const itemPrice = parseFloat(btn.dataset.price);

    // Optional: fetch full item from menu_items to verify
    const { data: items, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', itemId)
    .limit(1);

    if (error || !items || items.length === 0) {
    alert('Item not found.');
    return;
    }

    const item = items[0];

    // Insert into cart_items
    const { error: insertError } = await supabase
    .from('cart_items')
    .insert({
        user_id: user.id,
        item_id: item.id,
        quantity: 1,
    });

    if (insertError) {
    console.error(insertError);
    alert('Failed to add to cart.');
    } else {
    alert(`${item.namn} added to cart!`);
    }
});
});
