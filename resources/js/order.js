document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("orderForm");
  const prefillForm = document.getElementById("prefillForm");
  const product = document.getElementById("product");
  const quantity = document.getElementById("quantity");
  const buyer = document.getElementById("from");
  const address = document.getElementById("address");
  const shipping = document.querySelectorAll("input[name='shipping']");
  const summaryProduct = document.getElementById("summaryProduct");
  const summaryQuantity = document.getElementById("summaryQuantity");
  const summaryCost = document.getElementById("summaryCost");
  const cost = document.getElementById("cost");
  const date = document.getElementById("order_date");
  // remember me checkbox ex credit
  const rememberMeBox = document.getElementById("remember"); 
  let message = document.getElementById("orderMessage");
  if (!message && form){
    message = document.createElement("div");
    message.id = "orderMessage";
    form.parentNode.insertBefore(message, form);
  }
  // elements not met -- stop early
  if (!form || !product || !quantity || !buyer || !address  || !cost || !date) {
    return;
  }
  function dateTimeParse() {
    // https://www.w3schools.com/js/js_date_methods.asp for date methods
    const currDate = new Date();
    const year = currDate.getFullYear();
    // padStart from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
    const month = String(currDate.getMonth() + 1).padStart(2, '0');
    const day = String(currDate.getDate()).padStart(2, '0');
    const hours = String(currDate.getHours()).padStart(2, '0');
    const minutes = String(currDate.getMinutes()).padStart(2, '0');
    const seconds = String(currDate.getSeconds()).padStart(2, '0');
    return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
  }
  function summaryUpdate() {
    const options = product.options[product.selectedIndex];
    const prodCost = parseFloat(options.getAttribute("data-cost")) || 0;
    const prodQty = parseInt(quantity.value, 10) || 1;
    const totalCost = prodCost * prodQty;
    summaryProduct.textContent = product.value || "---";
    summaryQuantity.textContent = prodQty;
    summaryCost.textContent = totalCost.toFixed(2);
    cost.value = totalCost.toFixed(2);
  }
  function getShipping() {
    for (let i = 0; i < shipping.length; i++) {
      if (shipping[i].checked) {
        return shipping[i].value;
      }
    }
    return "";
  }
  product.addEventListener("change", summaryUpdate);
  quantity.addEventListener("input", summaryUpdate);
  if (prefillForm) {
    prefillForm.addEventListener("click", function () {
    product.value = "Mica Caps Mycelia Kit";
    quantity.value = 3;
    buyer.value = "Mildred Montgomery";
    address.value = "Mildred Montgomery\n888 Mycopia Main\nMagical, MO 88888";
    shipping[0].checked = true;
    summaryUpdate();
    date.value = dateTimeParse();
  });
}
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const options = product.options[product.selectedIndex];
    const prodCost = parseFloat(options.getAttribute("data-cost")) || 0;
    const prodQty = parseInt(quantity.value, 10) || 1;
    const totalCost = prodCost * prodQty;
    cost.value = totalCost.toFixed(2);
    date.value = dateTimeParse();



    const ord_data = {
      product: product.value,
      quantity: Number(quantity.value),
      from_name: buyer.value,
      address: address.value,
      shipping: getShipping(),
      cost: Number(cost.value),
      order_date: date.value
    }; 

    if (rememberMeBox && rememberMeBox.checked) { // remembers if selected
      ord_data.remember = true;
    }

    if (message){
      message.textContent = "Submitting order..."; 
    } 
  
    const submitButton = form.querySelector("button[type='submit']"); // submit button gets disabled when submitting 
    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(ord_data)
      });

      let body = null;
      try {
        body = await response.json();
      } catch (error) {
        body = null;
      }

      if (response.status === 201 && body && body.status === "success" && ("order_id" in body)) {
        if (message) {
          message.innerHTML = (
            "<p>Order Successful!</p>" +
            '<p><a href="/tracking/' + body.order_id + '">Track this order here!</a></p>'
          );
        }
        if (submitButton) {
          submitButton.disabled = false;
        }
        return;
      }
      if ((response.status === 400 || response.status === 413) && body && body.errors) {
        if (message) {
          var errorMessage = "The following errors occurred:\n";
          for (var i = 0; i < body.errors.length; i++) {
            errorMessage += "- " + body.errors[i] + "\n";
          }
          message.innerText = errorMessage;
        }
        if (submitButton) submitButton.disabled = false;
        return;
      }
      if (message) message.textContent = "Could not place order. Please try again.";
      if (submitButton) submitButton.disabled = false;
    } catch (error) {
      if (message) message.textContent = "Network error occurred. Please try again.";
      if (submitButton) submitButton.disabled = false;
    }
  });
  summaryUpdate();
  });




