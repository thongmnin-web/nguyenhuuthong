// Quản lý đơn hàng: Hiển thị danh sách đơn hàng từ localStorage
window.onload = function() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const tableBody = document.querySelector("#orders-table tbody");
  const noOrders = document.getElementById("no-orders");

  if (orders.length === 0) {
    noOrders.style.display = "block";
    return;
  }

  orders.forEach(order => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${order.time || ""}</td>
      <td>${order.name}</td>
      <td>${order.address}</td>
      <td>${order.phone}</td>
      <td class="order-items">
        <ul style="margin:0; padding-left:18px;">
          ${(order.items || []).map(item => `<li>${item.name} (${item.price.toLocaleString()}đ)</li>`).join("")}
        </ul>
      </td>
    `;
    tableBody.appendChild(tr);
  });
};
