function goToHomepage(){
  window.location.href = '../../../index/index.html';  
}

function goToSushi() {
    window.location.href = 'menus/sushi/sushimenu.html';
  }

function goToHamburger() {
    window.location.href = 'menus/hamburger/hamburgermenu.html';
  }

function goToPizza() {
    window.location.href = 'menus/pizza/pizzamenu.html';
  }

function goToNoodle() {
    window.location.href = 'menus/noodle/noodlemenu.html';
  }

function goToGrill() {
    window.location.href = 'menus/grill/grillmenu.html';
  }

function goToSpagetthi() {
    window.location.href = 'menus/spagetthi/spagetmenu.html';
  }

function goToGalleri(){
    window.location.href = '../../galleri.html'
}

function goToKassa(){
  window.location.href = '../../../../kassan/kassa.html'
}

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


