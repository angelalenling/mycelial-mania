document.addEventListener("DOMContentLoaded", function () {
  const SHIP_MIN = 5;
  const shipStatus = document.getElementById("status");
  const shipCountdown = document.getElementById("countdown");
  const shipOrderDate = document.getElementById("orderDate");
  const updateButton = document.getElementById("update");
  const updateShipping = document.getElementById("updateShipping");
  const cancelButton = document.getElementById("cancelButton");
  const trackingMessage = document.getElementById("trackingMessage");
  const statusMessage = document.querySelector(".status-message");



  if (!shipStatus || !shipCountdown || !shipOrderDate) { // stops early if anything missing
    return;
  }

  const placedTime = new Date(shipOrderDate.textContent.replace(" ", "T").trim());
  if (isNaN(placedTime.getTime())) {
    return;
  }
  const shipmentTime = new Date(placedTime.getTime() + SHIP_MIN * 60000);

  function updateCountdown() {
    let statusTxt = (shipStatus.textContent || "").trim().toLowerCase();
    if (statusTxt === "cancelled" || statusTxt === "shipped" || statusTxt === "delivered") {
      shipCountdown.textContent = (statusTxt === "cancelled") ? "Order Cancelled" : "Order shipped";
      if (cancelButton) cancelButton.style.display = "none";
      if (updateButton) updateButton.style.display = "none";
      if (updateShipping) updateShipping.style.display = "none";
      return;
    }
    const remainingTimeMS = shipmentTime - new Date(); // in milliseconds

    if (remainingTimeMS <= 0) {
      shipCountdown.textContent = "Order shipped";
      if (cancelButton) cancelButton.style.display = "none";
      if (updateButton) updateButton.style.display = "none";
      if (updateShipping) updateShipping.style.display = "none";
      return;
    }
    const mins = Math.floor(remainingTimeMS / 60000); // MS converted to minutes
    const seconds = Math.floor(remainingTimeMS / 1000) % 60; // MS converted to seconds
    // padStart method from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
    shipCountdown.textContent = String(mins).padStart(2, '0') + 'm ' + String(seconds).padStart(2, '0') + 's';
  }
  updateCountdown();
  setInterval(updateCountdown, 1000); // refreshes every 1000ms (1 second)
// "When pressed, the button text should change to something like "Cancel Update", and a shipping update form should appear in-line with the order details, in a similar format and layout"
  if (updateButton && updateShipping) {
    updateButton.addEventListener("click", function (e) {
      e.preventDefault();
      const hide = (updateShipping.style.display === "" || updateShipping.style.display === "none");
      if (hide) {
        updateShipping.style.display = "block";
        updateButton.textContent = "Cancel Update";
      }
      else {
        updateShipping.style.display = "none";
        updateButton.textContent = "Update Shipping";
      }
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", async function (e) {
      e.preventDefault();
      let orderId = cancelButton.getAttribute("data-order-id");
      if (!orderId) {
        const hidden = document.querySelector("#updateShipping input[name='id']");
        if (hidden) orderId = hidden.value;
      }

  if (!orderId || Number.isNaN(Number(orderId))) {
    if (trackingMessage) trackingMessage.textContent = "The order ID was invalid";
    return;
  }
      const oldText = cancelButton.textContent;
    cancelButton.disabled = true;
    cancelButton.textContent = "Cancelling...";

    try {
      const response = await fetch("/api/cancel_order", {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json" 
        },
        credentials: "include",
        body: JSON.stringify({ order_id: Number(orderId) })
      });

 
      if (response.status === 204) {
        if (trackingMessage) trackingMessage.textContent = "Order has been cancelled.";
        if (shipStatus) shipStatus.textContent = "Cancelled";
        if (shipCountdown) shipCountdown.textContent = "Order Cancelled";
        if (statusMessage) statusMessage.textContent = "Your order has been cancelled!";
        if (cancelButton) cancelButton.style.display = "none";
        if (updateButton) updateButton.style.display = "none";
        if (updateShipping) updateShipping.style.display = "none";
      } else if (response.status === 404) {
        if (trackingMessage) trackingMessage.textContent = "This failed because the order cannot be found";
        cancelButton.disabled = false;
        cancelButton.textContent = oldText;
      } else if (response.status === 400) {
        if (trackingMessage) trackingMessage.textContent = "The order ID was invalid";
        cancelButton.disabled = false;
        cancelButton.textContent = oldText;
      } else {
        if (trackingMessage) trackingMessage.textContent = "Could not cancel. Please try again.";
        cancelButton.disabled = false;
        cancelButton.textContent = oldText;
      }
    } catch (err) {
      if (trackingMessage) trackingMessage.textContent = "Network error occurred. Please try again.";
      cancelButton.disabled = false;
      cancelButton.textContent = oldText;
    }
  });
}
});



