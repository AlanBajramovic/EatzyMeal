import supabase from "./supabaseClient";
  
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.addToCartBtn');

  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      const mealId = parseInt(button.dataset.id);

      try {
        const response = await fetch('/add-to-cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ meal_id: mealId }),
        });

        const result = await response.text();
        alert(result);
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to add to cart.');
      }
    });
  });
});
