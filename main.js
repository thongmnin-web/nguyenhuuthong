let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Thêm sản phẩm (có thêm ảnh)
function addToCart(name, price, img) {
  cart.push({ name, price, img });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(name + " đã được thêm vào giỏ!");
}

// Load giỏ hàng
function loadCart() {
  let cartItems = document.getElementById("cart-items");
  let total = 0;
  cartItems.innerHTML = "";

  cart.forEach((item, index) => {
    let li = document.createElement("li");
    li.innerHTML = `
      <img src="${item.img}" alt="${item.name}" style="max-width: 60px; max-height: 60px; object-fit: cover;">
      <div class="info">
        <strong>${item.name}</strong><br>
        <span>${item.price.toLocaleString()}đ</span>
      </div>
      <button onclick="removeFromCart(${index})">❌ Xóa</button>
    `;
    cartItems.appendChild(li);
    total += item.price;
  });

  document.getElementById("total").textContent = "Tổng: " + total.toLocaleString() + "đ";
}

// Xóa sản phẩm
function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}


// Khi load trang giỏ
if (document.getElementById("cart-items")) {
  loadCart();
  // Xử lý nút mua hàng
  const checkoutBtn = document.getElementById("checkout-btn");
  const checkoutForm = document.getElementById("checkout-form");
  const confirmBtn = document.getElementById("confirm-btn");
  if (checkoutBtn && checkoutForm && confirmBtn) {
    checkoutBtn.onclick = function() {
      if (cart.length === 0) {
        alert("Giỏ hàng trống!");
        return;
      }
      checkoutForm.style.display = "block";
    };
    confirmBtn.onclick = function() {
      const name = document.getElementById("name").value.trim();
      const address = document.getElementById("address").value.trim();
      const phone = document.getElementById("phone").value.trim();
      if (!name || !address || !phone) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }
      // Lưu đơn hàng vào localStorage
      let orders = JSON.parse(localStorage.getItem("orders")) || [];
      orders.push({
        name,
        address,
        phone,
        items: cart.slice(),
        time: new Date().toLocaleString()
      });
      localStorage.setItem("orders", JSON.stringify(orders));
      // Xử lý xác nhận đơn hàng
      alert(`Cảm ơn bạn ${name} đã đặt hàng! Đơn hàng sẽ được giao tới: ${address}. SĐT: ${phone}`);
      cart = [];
      localStorage.setItem("cart", JSON.stringify(cart));
      loadCart();
      checkoutForm.style.display = "none";
      document.getElementById("name").value = "";
      document.getElementById("address").value = "";
      document.getElementById("phone").value = "";
    };
  }
}
