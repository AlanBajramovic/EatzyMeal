function goToGalleri(){
    window.location.href = '../../FoodGalleri/galleri.html'
}

function buy(){
    alert("Din beställning har gått igenom")
  }

  const buttonGroup = document.getElementById('paymentButtons');
  const buttons = buttonGroup.querySelectorAll('.btn');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active')); // remove active from all
      button.classList.add('active'); // add to clicked one
    });
  });