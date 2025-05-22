document.querySelectorAll('.addToCart').forEach(button => {
  button.addEventListener('click', (e) => {
    const popup = document.createElement('div');
    popup.classList.add('check-popup');
    popup.innerHTML = '+1';

    // Positionen vid knappen
    const rect = button.getBoundingClientRect();
    popup.style.left = `${rect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top - 20 + window.scrollY}px`; // flyttas up

    document.body.appendChild(popup);

    // animation till att det försvinner
    setTimeout(() => {
      popup.remove();
    }, 1000);
  });
});


