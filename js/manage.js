const ORDERS_KEY = 'shop_orders';

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}


async function renderOrders() {
    const tableBody = document.querySelector('#orders-table tbody');
    const noOrdersMsg = document.getElementById('no-orders');

    // fetch from backend instead of localStorage
    let orders = [];
    try {
        const resp = await fetch('/orders');
        if (resp.ok) {
            orders = await resp.json();
        } else {
            console.error('failed to load orders');
        }
    } catch (e) {
        console.error('fetch error', e);
    }

    if (orders.length === 0) {
        if(noOrdersMsg) noOrdersMsg.style.display = 'block';
        if(tableBody) tableBody.innerHTML = ''; 
        return;
    }


    if(noOrdersMsg) noOrdersMsg.style.display = 'none';

    let html = '';
    
    
    orders.slice().reverse().forEach(order => {
        
      
        let productList = order.items.map(item => 
            `- ${item.name} <b>(x${item.quantity})</b>`
        ).join('<br>');

        html += `
            <tr>
                <td>${order.date}</td>
                <td><strong>${order.customer.name}</strong></td>
                <td>
                    ${order.customer.phone} <br>
                    <span style="color:#666; font-size:0.9rem;">${order.customer.address}</span>
                </td>
                <td>
                    ${productList}
                    <br><br>
                    <strong style="color:#0dec84;">Tổng: ${formatCurrency(order.totalPrice)}</strong>
                </td>
                <td style="text-align:center;">
                    <button onclick="deleteOrder(${order.id})" 
                            style="background: #ff4d4d; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                        Đã giao / Xóa
                    </button>
                </td>
            </tr>
        `;
    });

    if(tableBody) tableBody.innerHTML = html;
}


async function deleteOrder(orderId) {
    if (confirm('Bạn chắc chắn muốn xóa đơn hàng này? (Hành động này không thể hoàn tác)')) {
        try {
            await fetch(`/orders/${orderId}`, { method: 'DELETE' });
        } catch (e) {
            console.error('delete request failed', e);
        }
        renderOrders();
    }
}


document.addEventListener('DOMContentLoaded', () => {
   
    renderOrders();
});