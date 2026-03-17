// ===== ORIGINAL MYSQL SETUP (COMMENTED OUT) =====
// const mysql = require('mysql2/promise');
// const pool = mysql.createPool({
//   host: 'localhost',
//   port: 3307,
//   user: 'your_user_here',
//   password: 'your_password_here',
//   database: 'your_database_here',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });


// ===== MOCK DATA (USED FOR LOCAL / GITHUB DEMO) =====
const orders = [
  {
    id: 1,
    status: 'Placed',
    cost: 20.00,
    from: 'Test User',
    address: '123 Test St',
    product: 'Mica Caps Mycelia Kit',
    quantity: 1,
    notes: 'Test order',
    shipping: 'Flat Rate',
    order_date: new Date().toISOString()
  }
];


// ===== ORIGINAL FUNCTIONS =====

// async function addOrder(orderData) { ... }
// async function getOrders(query, status) { ... }
// async function getOrder(id) { ... }
// async function updateOrder(id, shipping, address) { ... }
// async function cancelOrder(id) { ... }
// async function updateOrderStatuses() { ... }
// async function getOrderHistory(id) { ... }


// ===== MOCK IMPLEMENTATIONS (ACTIVE) =====

// Add Order
async function addOrder(orderData) {
  const newId = orders.length + 1;

  const newOrder = {
    id: newId,
    status: 'Placed',
    cost: orderData.cost || 0,
    from: orderData.from_name,
    address: orderData.address,
    product: orderData.product,
    quantity: orderData.quantity,
    notes: orderData.notes || '',
    shipping: orderData.shipping,
    order_date: orderData.order_date || new Date().toISOString()
  };

  orders.push(newOrder);
  return newId;
}


// Get Orders (with filtering)
async function getOrders(query, status) {
  let filtered = orders;

  if (status && status !== 'all') {
    filtered = filtered.filter(o =>
      o.status.toLowerCase() === status.toLowerCase()
    );
  }

  if (query) {
    filtered = filtered.filter(o =>
      o.from.toLowerCase().includes(query.toLowerCase())
    );
  }

  return filtered;
}


// Get Single Order
async function getOrder(id) {
  return orders.find(o => o.id === id) || null;
}


// Update Order
async function updateOrder(id, shipping, address) {
  const order = orders.find(o => o.id === id);
  if (order) {
    order.shipping = shipping;
    order.address = address;
  }
}


// Cancel Order
async function cancelOrder(id) {
  const order = orders.find(o => o.id === id);
  if (!order) return false;

  const status = order.status.toLowerCase();
  if (['cancelled', 'shipped', 'delivered'].includes(status)) {
    return false;
  }

  order.status = 'Cancelled';
  return true;
}


// Simulate automatic status updates
async function updateOrderStatuses() {
  const now = Date.now();

  orders.forEach(order => {
    const orderTime = new Date(order.order_date).getTime();

    if (order.status === 'Placed' && now - orderTime > 5 * 60 * 1000) {
      order.status = 'Shipped';
    }
  });
}


// Mock Order History
async function getOrderHistory(id) {
  return [
    {
      shipping: 'Flat Rate',
      address: '123 Test St',
      update_time: new Date().toISOString()
    }
  ];
}


// ===== EXPORTS =====
module.exports = {
  addOrder,
  getOrders,
  getOrder,
  updateOrder,
  cancelOrder,
  updateOrderStatuses,
  getOrderHistory
};