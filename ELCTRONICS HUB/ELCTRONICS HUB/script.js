// Render home items with buttons hidden
const homeItems = document.getElementById('homeItems');
Object.values(products).flat().forEach(item => {
  const div = document.createElement('div');
  div.classList.add('item');

  div.innerHTML = `
    <img src="${item.img}" alt="${item.name}">
    <h3>${item.name}</h3>
    <div class="buttons" style="display:none;">
      <button class="buy-btn" onclick="showPaymentOptions(event, '${item.name}', ${item.price})">Buy Now</button>
      <button class="cart-btn" onclick="addToCart('${item.name}', ${item.price})">Add to Cart</button>
      <div class="payment-options" style="margin-top:8px;"></div>
    </div>
  `;

  // Toggle buttons and hide payment options on item click
  div.addEventListener('click', (e) => {
    if(e.target.tagName !== "BUTTON"){ // Prevent toggling when clicking button
      const buttonsDiv = div.querySelector('.buttons');
      buttonsDiv.style.display = buttonsDiv.style.display === 'none' ? 'block' : 'none';
      // Hide payment options if collapsing
      const paymentDiv = div.querySelector('.payment-options');
      paymentDiv.innerHTML = '';
    }
  });

  homeItems.appendChild(div);
});

// Render category items similarly
function showCategory(category) {
  currentCategory = category;
  document.getElementById('backArrow').style.display = 'inline';
  navigate('items');
  document.getElementById('itemsTitle').innerText = category.toUpperCase();

  const grid = document.getElementById('itemGrid');
  grid.innerHTML = '';

  products[category]?.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('item');

    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <h3>${item.name}</h3>
      <div class="buttons" style="display:none;">
        <button class="buy-btn" onclick="showPaymentOptions(event, '${item.name}', ${item.price})">Buy Now</button>
        <button class="cart-btn" onclick="addToCart('${item.name}', ${item.price})">Add to Cart</button>
        <div class="payment-options" style="margin-top:8px;"></div>
      </div>
    `;

    div.addEventListener('click', (e) => {
      if(e.target.tagName !== "BUTTON"){
        const buttonsDiv = div.querySelector('.buttons');
        buttonsDiv.style.display = buttonsDiv.style.display === 'none' ? 'block' : 'none';
        const paymentDiv = div.querySelector('.payment-options');
        paymentDiv.innerHTML = '';
      }
    });

    grid.appendChild(div);
  });
}

// Show payment options below Buy Now
function showPaymentOptions(event, name, price) {
  event.stopPropagation(); // Prevent toggling buttons div
  const buttonsDiv = event.target.parentElement;
  const paymentDiv = buttonsDiv.querySelector('.payment-options');
  
  paymentDiv.innerHTML = `
    <button onclick="placeOrder('${name}', ${price}, 'Cash on Delivery')">Cash on Delivery</button>
    <button onclick="placeOrder('${name}', ${price}, 'UPI')">Pay by UPI</button>
  `;
}

// Place order function
function placeOrder(name, price, method) {
  alert(`Order placed for ${name} (Price: ₹${price}) via ${method}`);
  // You can also add this to cart/orders logic
}
