  const buttonGroup = document.getElementById('paymentButtons');
  const buttons = buttonGroup.querySelectorAll('.btn');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active')); // remove active from all
      button.classList.add('active'); // add to clicked one
    });
  });

  

const paymentButtons = document.querySelectorAll(".payment-btn");
let selectedPayment = null;

  paymentButtons.forEach(button => {
    button.addEventListener("click", () => {
      paymentButtons.forEach(btn => btn.classList.remove("selected"));
      button.classList.add("selected");
      selectedPayment = button;
    });
  });

  // Buy function
  function buy() {
    const address = document.getElementById("address").value.trim();

    if (address === "") {
      alert("Fyll i adressen.");
      return;
    }

    if (!selectedPayment) {
      alert("Välj en betalningsmetod.");
      return;
    }

    // Proceed with purchase
    alert("Beställningen har genomförts!");
  }

