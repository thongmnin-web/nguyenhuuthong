
const CART_KEY = 'shop_cart'; 
const ORDERS_KEY = 'shop_orders'; 
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}


function addToCart(name, price, img) {
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    let existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: price, img: img, quantity: 1 });
    }
    
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
 
    if (!window.location.pathname.includes('cart.html')) {
        alert(`Đã thêm "${name}" vào giỏ hàng!`);
    }
}


function renderCart() {
    const cartBody = document.getElementById('cart-body');
    const totalPriceEl = document.getElementById('total-price');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const cartTable = document.querySelector('.cart-table');

    // Nếu không có thẻ cart-body thì dừng (đang ở trang khác)
    if (!cartBody) return;

    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

    // Nếu giỏ hàng trống
    if (cart.length === 0) {
        cartTable.style.display = 'none';
        emptyMsg.style.display = 'block';
        if(totalPriceEl) totalPriceEl.innerText = '0đ';
        return;
    }

    // Nếu có sản phẩm
    cartTable.style.display = 'table';
    emptyMsg.style.display = 'none';
    
    let total = 0;
    let html = '';

    cart.forEach((item, index) => {
        let itemTotal = item.price * item.quantity;
        total += itemTotal;

        html += `
            <tr>
                <td>
                    <div class="item-info">
                        <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60'">
                        <div>
                            <strong>${item.name}</strong>
                        </div>
                    </div>
                </td>
                <td style="font-weight: 600;">${formatCurrency(item.price)}</td>
                <td>
                    <input type="number" value="${item.quantity}" min="1" 
                           onchange="updateQuantity(${index}, this.value)"
                           style="width: 50px; padding: 5px; border-radius: 4px; border: 1px solid #ddd;">
                </td>
                <td>
                    <button class="btn-remove" onclick="removeFromCart(${index})">Xóa</button>
                </td>
            </tr>
        `;
    });

    cartBody.innerHTML = html;
    if(totalPriceEl) totalPriceEl.innerText = formatCurrency(total);
}

function removeFromCart(index) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này không?')) {
        let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        cart.splice(index, 1); 
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCart();
    }
}


function handleCheckout(e) {
    e.preventDefault();
    
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    if (cart.length === 0) {
        alert('Giỏ hàng đang trống!');
        return;
    }

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const btnSubmit = document.querySelector('.btn-checkout');

    if (phone.length < 10) {
        alert("Vui lòng nhập số điện thoại hợp lệ!");
        return;
    }

    // animations
    btnSubmit.innerHTML = "⏳ Đang gửi đơn hàng...";
    btnSubmit.disabled = true;

    // animations end
    let productNames = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');
    let totalMoney = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let dataToSend = {
        date: new Date().toLocaleString('vi-VN'),
        name: name,
        phone: phone,
        address: address,
        items: productNames,
        total: formatCurrency(totalMoney)
    };


    // send order to our own backend (/orders)
    fetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(savedOrder => {
        const yourZaloPhone = '84397768941'; // Số của bạn
        let msg = `DON HANG MOI!\nKhach: ${name}\nSDT: ${phone}\nTong: ${formatCurrency(totalMoney)}\nChi tiet: ${productNames}`;
        const zaloUrl = `https://zalo.me/${yourZaloPhone}?text=${encodeURIComponent(msg)}`;

        localStorage.removeItem(CART_KEY);
        
        if (confirm('Đã gửi đơn hàng thành công! Bấm OK để báo qua Zalo.')) {
            window.location.href = zaloUrl;
        } else {
            window.location.href = 'index.html';
        }
    })
    .catch(error => {
        alert("Có lỗi xảy ra, vui lòng thử lại!");
        btnSubmit.innerHTML = "Xác Nhận Đặt Hàng";
        btnSubmit.disabled = false;
        console.error('Error:', error);
    });
}
//auto render cart on page load
document.addEventListener('DOMContentLoaded', renderCart);
