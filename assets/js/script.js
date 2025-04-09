"use strict";
const filteringContainer = document.querySelector(".filtering-container");
const selectCategory = document.querySelector(".filter-category");
const cartContainer = document.querySelector(".cart-items");

(function () {
  fetch("./data.json")
    .then((response) => response.json())
    .then((data) => {
      launchStore(data);
    })
    .catch((error) => console.error("error fetching data:", error));
})();

let cartItemsArr = [],
  lovedItems = [];

function launchStore(data) {
  // add products from JSON to html file
  addProducts(data);
  initializeSelectCategory(data);
  userSavedData(data);
  // user is coming from the cart page
  if (localStorage.getItem("checkout")) {
    orderConfirmed(data);
  }
  // making an array to include all btns we need to give it eventListener
  let productBtns = document.querySelectorAll(
    ".card-image-add-to-cart, .card-product-decrease-btn, .card-product-increase-btn, .order-btn, .btn-new-order"
  );
  // adding eventListener to needed btns
  for (let i = 0; i < productBtns.length; i++) {
    productBtns[i].addEventListener("click", function () {
      // let index = this.getAttribute("data-index");

      if (this.className === "order-btn") {
        if (!localStorage.getItem("signed")) window.location = "./sign.html";
        orderConfirmed(data);
      } else if (this.className === "btn-new-order") {
        startNewOrder(data);
      }
      trackingCart();
    });
  }

  // Event Handlers
  filteringContainer.addEventListener("input", function (e) {
    if (e.target.nodeName == "SELECT") {
      e.target.value == "All"
        ? addProducts(data, {})
        : addProducts(data, { category: e.target.value });

      cartContainer.innerHTML = "";
      userSavedData(data);
    } else if (e.target.nodeName == "INPUT") {
      addProducts(data, { text: e.target.value });

      cartContainer.innerHTML = "";
      userSavedData(data);
    }
  });
}
// start new order by removing any eventListener and reset items
function startNewOrder(data) {
  // defining needed elements
  let productsContainer = document.querySelector(".products-container"),
    orderConfirmedProductsContainer = document.querySelector(
      ".order-confirmed-products-container"
    ),
    orderConfirmedContainer = document.querySelector(
      ".order-confirmed-container"
    ),
    btnNewOrder = document.createElement("button"),
    orderBtn = document.createElement("div"),
    orderItems = document.querySelector(".shopping-cart .order-items"),
    cartItems = document.querySelector(".cart-items"),
    storeOrderConfirmed = document.querySelector(".store .order-confirmed");
  // remove receipt with a fading animation using jQuery
  $(storeOrderConfirmed).fadeOut(500);
  // removing and adding products again getting the case that JSON file has been updated
  productsContainer.innerHTML = "";
  orderConfirmedProductsContainer.innerHTML = "";
  cartItems.innerHTML = "";
  // removing buttons and adding them back to reset eventListener
  orderConfirmedContainer.removeChild(document.querySelector(".btn-new-order"));
  orderItems.removeChild(document.querySelector(".order-btn"));
  btnNewOrder.className = "btn-new-order";
  btnNewOrder.textContent = "start new order";
  orderBtn.className = "order-btn";
  orderBtn.textContent = "confirm order";
  orderConfirmedContainer.appendChild(btnNewOrder);
  orderItems.appendChild(orderBtn);
  // after removing any eventListener and clearing items we launch the store
  localStorage.removeItem("cartItems");
  localStorage.removeItem("checkout");
  launchStore(data);
}

function initializeSelectCategory(data) {
  // Add Select Items
  for (let i = 0; i < data.length; i++) {
    selectCategory.insertAdjacentHTML(
      "beforeend",
      `<option value="${data[i].category}">${data[i].category}</option>`
    );
  }
}

function orderConfirmed(data) {
  // defining needed elements
  let cartItem = document.querySelectorAll(".cart-item"),
    orderConfirmedProductsContainer = document.querySelector(
      ".order-confirmed-products-container"
    ),
    orderTotalElement = document.querySelector(".cart-total-price-value"),
    storeOrderConfirmed = document.querySelector(".store .order-confirmed"),
    cartItemIndex = [];
  for (let i = 0; i < cartItem.length; i++) {
    cartItemIndex.push(cartItem[i].getAttribute("data-index"));
  }
  // show receipt with a fading animation using jQuery
  $(storeOrderConfirmed).fadeIn(500);
  // creating the item that will be added to the receipt
  for (let i = 0; i < cartItemIndex.length; i++) {
    // defining needed variables
    let index = cartItemIndex[i],
      itemQuantity = document.querySelector(
        `.cart-item .quantity-counter[data-index='${index}']`
      ),
      itemCounter = itemQuantity.getAttribute("data-count");
    // adding item to container
    orderConfirmedProductsContainer.insertAdjacentHTML(
      "beforeend",
      `<div class="order-confirmed-container-items-item"><div class="order-confirmed-image"><img class="order-product-img" src="${
        data[index]["image"]["thumbnail"]
      }"><div class="order-product-text"><h3 class="order-product-title">${
        data[index]["name"]
      }</h3><p class="order-product-p"><span class="quantity-counter">${itemCounter}x</span>&nbsp;&nbsp; @ $${data[
        index
      ]["price"].toFixed(
        2
      )}&nbsp;&nbsp;</p></div></div><div class="order-product-total"><span class="order-product-total-price">$${(
        data[index]["price"] * itemCounter
      ).toFixed(2)}</span></div></div>`
    );
  }
  // updating the receipt total price to equal the cart total price
  document.querySelector(".order-confirmed-total-price").textContent =
    orderTotalElement.textContent;
}
// track cart statue if item got added, deleted, updated, etc...
function trackingCart() {
  // defining needed elements
  const bagCart = document.querySelector(".cart-icon-counter");
  let quantityCounterArr = document.querySelectorAll(
      ".cart-item .quantity-counter"
    ),
    quantityTotalArr = document.querySelectorAll(".cart-item .quantity-total"),
    cartCounterElement = document.querySelector(
      ".shopping-cart .cart-quantity"
    ),
    cartEmpty = document.querySelectorAll(".cart-empty"),
    orderItems = document.querySelector(".order-items"),
    orderTotalElement = document.querySelector(".cart-total-price-value"),
    orderTotal = 0,
    cartCounter = 0;
  // calculating the total receipt price by adding total price of each element
  for (let i = 0; i < quantityTotalArr.length; i++) {
    let price = quantityTotalArr[i].textContent;
    price = price.slice(1);
    orderTotal += Number(price);
  }
  // getting the quantity of each item to update cart counter
  for (let i = 0; i < quantityCounterArr.length; i++) {
    let quantity = Number(quantityCounterArr[i].getAttribute("data-count"));
    cartCounter += quantity;
  }

  if (cartCounter === 0) {
    // show the cart empty image and text
    for (let i = 0; i < cartEmpty.length; i++) {
      cartEmpty[i].classList.remove("hidden");
    }
    // show the active state of having items (order button, order total, text)
    orderItems.classList.add("hidden");
  } else {
    // remove the cart empty image and text
    for (let i = 0; i < cartEmpty.length; i++) {
      cartEmpty[i].classList.add("hidden");
    }
    // show the active state of having items (order button, order total, text)
    orderItems.classList.remove("hidden");
  }
  // assigning values
  orderTotal = orderTotal.toFixed(2);
  cartCounterElement.textContent = cartCounter;
  bagCart.textContent = cartCounter;
  orderTotalElement.textContent = orderTotal;
}

// increase the quantity of product
function increaseQuantityItem(data, index) {
  const arrIndex = cartItemsArr.findIndex((item) => item.index === index);
  // defining needed elements
  let quantityCounter = document.querySelector(
      `.quantity-counter[data-index='${index}']`
    ),
    counter = Number(quantityCounter.getAttribute("data-count")),
    itemQuantity = document.querySelector(
      `.card-product-counter[data-index='${index}']`
    ),
    quantityTotalPrice = document.querySelector(
      `.quantity-total[data-index='${index}']`
    ),
    price = data[index]["price"];
  counter++;
  // store the counter value in data-count attribute so we track it
  quantityCounter.setAttribute("data-count", counter);
  quantityCounter.textContent = `${counter}x`;
  quantityTotalPrice.textContent = `$${(counter * price).toFixed(2)}`;
  // handling edge case where item is not exist hence user used search
  itemQuantity && (itemQuantity.textContent = counter);
  // Update item counter in localstorage

  cartItemsArr[arrIndex].counter = counter;
  localStorage.setItem("cartItems", JSON.stringify(cartItemsArr));
}

// decrease the quantity of product and delete it from the cart if it reach zero
function decreaseQuantityItem(data, index) {
  // defining needed elements
  let quantityCounter = document.querySelector(
      `.quantity-counter[data-index='${index}']`
    ),
    counter = Number(quantityCounter.getAttribute("data-count")),
    itemQuantity = document.querySelector(
      `.card-product-counter[data-index='${index}']`
    ),
    quantityTotalPrice = document.querySelector(
      `.quantity-total[data-index='${index}']`
    ),
    price = data[index]["price"];
  // if user clicked the negative sign till zero item will be deleted otherwise decrease quantity
  if (counter - 1 === 0) {
    deleteCartItem(index);
  } else {
    counter--;
    quantityCounter.setAttribute("data-count", counter);
    quantityCounter.textContent = `${counter}x`;
    itemQuantity.textContent = counter;
    quantityTotalPrice.textContent = `$${(counter * price).toFixed(2)}`;
    // Update item counter in localstorage
    const arrIndex = cartItemsArr.findIndex((item) => item.index === index);
    cartItemsArr[arrIndex].counter = counter;
    localStorage.setItem("cartItems", JSON.stringify(cartItemsArr));
  }
}

// creating item, adding it to cart, giving it an eventListener to help deleteItem function
function addToCart(data, index) {
  // defining targeted elements
  let clickedAddToCartButton = document.querySelector(
      `.card-image-add-to-cart[data-index='${index}']`
    ),
    productQuantityElement = document.querySelector(
      `.card-product-quantity[data-index='${index}']`
    ),
    cardProductImage = document.querySelector(
      `.card-product-image[data-index='${index}']`
    );
  cardProductImage?.classList.add("change-image-border");
  clickedAddToCartButton?.classList.add("hidden");
  productQuantityElement?.classList.remove("hidden");

  // defining needed elements

  let itemPrice = data[index]["price"];

  cartContainer.insertAdjacentHTML(
    "beforeend",
    `<div class="cart-item" data-index="${index}"><div class="card-text"><h3 class="cart-item-title">${
      data[index]["name"]
    }</h3><p class="cart-item-p"><span class="quantity-counter" data-count="1" data-index="${index}">1x</span>&nbsp;&nbsp; @ $${itemPrice.toFixed(
      2
    )}&nbsp;&nbsp;<span class="quantity-total" data-index="${index}">$${itemPrice.toFixed(
      2
    )}</span></p></div><div class="delete-item" data-index="${index}"><img src="./assets/images/icon-remove-item.svg"></div></div>`
  );
  // adding eventListener to delete item icon in cart
  document
    .querySelector(`.delete-item[data-index="${index}"]`)
    .addEventListener("click", function () {
      // delete the item that have the clicked remove btn and call trackingCart to update cart
      deleteCartItem(this.getAttribute("data-index"));
      trackingCart();
    });
  const itemIndex = cartItemsArr.findIndex((item) => item.index === index);
  if (itemIndex === -1) {
    cartItemsArr.push({
      index,
      itemPrice,
      counter: 1,
    });
    localStorage.setItem("cartItems", JSON.stringify(cartItemsArr));
  }
}

// delete item from the cart
function deleteCartItem(index) {
  // defining needed elements
  let quantityCounter = document.querySelector(
      `.quantity-counter[data-index='${index}']`
    ),
    clickedAddToCartButton = document.querySelector(
      `.card-image-add-to-cart[data-index='${index}']`
    ),
    productQuantityElement = document.querySelector(
      `.card-product-quantity[data-index='${index}']`
    ),
    cartItems = document.querySelector(".cart-items"),
    item = document.querySelector(`.cart-item[data-index='${index}']`),
    cardProductImage = document.querySelector(
      `.card-product-image[data-index='${index}']`
    );
  cardProductImage.classList.remove("change-image-border");
  cartItems.removeChild(item);
  // removing the quantity element and getting the add to cart button of item back
  clickedAddToCartButton.classList.remove("hidden");
  productQuantityElement.classList.add("hidden");
  // reset the quantity counter of item
  quantityCounter.setAttribute("data-count", 1);

  // remove item from the array then update array in the local storage
  const arrIndex = cartItemsArr.findIndex((item) => item.index === index);
  cartItemsArr.splice(arrIndex, 1);
  localStorage.setItem("cartItems", JSON.stringify(cartItemsArr));
}

// adding products to the grid container
function addProducts(data, options = {}) {
  let productsContainer = document.querySelector(".products-container");
  // Initialize container
  productsContainer.innerHTML = "";
  // add data to products container
  for (let i = 0; i < data.length; i++) {
    if (options.text) {
      const typedText = options.text.toLowerCase();
      const categoryText = data[i].category.toLowerCase();
      const nameText = data[i].name.toLowerCase();
      if (!categoryText.includes(typedText) && !nameText.includes(typedText))
        continue;
    } else if (options.category && data[i].category != options.category) {
      continue;
    }

    let imageSrc;
    if (window.innerWidth > 1200) {
      imageSrc = data[i]["image"]["desktop"];
    } else if (window.innerWidth > 580) {
      imageSrc = data[i]["image"]["tablet"];
    } else {
      imageSrc = data[i]["image"]["mobile"];
    }

    productsContainer.insertAdjacentHTML(
      "beforeend",
      `<div class="card" data-index="${i}"><div class="loved-container" data-index="${i}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#808080" class="bi bi-suit-heart-fill" viewBox="0 0 16 16">
                  <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1"></path>
                </svg>
              </div><div class="card-image"><img class="card-product-image" src="${imageSrc}" data-index="${i}"><div class="card-product-quantity hidden" data-index="${i}"><button class="card-product-decrease-btn" data-index="${i}"><img src="./assets/images/icon-decrement-quantity.svg"></button><p class="card-product-counter" data-index="${i}"></p><button class="card-product-increase-btn" data-index="${i}"><img src="./assets/images/icon-increment-quantity.svg"></button></div><button class="card-image-add-to-cart" data-index="${i}"><img src="./assets/images/icon-add-to-cart.svg"><p>Add to Cart</p></button></div><h3 class="card-title">${
        data[i]["category"]
      }</h3><p class="card-p">${
        data[i]["name"]
      }</p><p class="card-price">$${data[i]["price"].toFixed(2)}</p></div>
    `
    );
    // Event Handlers
    document
      .querySelector(`.loved-container[data-index="${i}"]`)
      .addEventListener("click", function () {
        if (!localStorage.getItem("signed")) {
          window.location = "./sign.html";
          return;
        }
        const icon = this.querySelector("svg");
        if (icon.style.fill == "red") {
          icon.style.fill = "#808080";
          const lovedIndex = lovedItems.findIndex(
            (i) => i == this.dataset.index
          );
          lovedItems.splice(lovedIndex, 1);
          localStorage.setItem("lovedItems", JSON.stringify(lovedItems));
        } else {
          icon.style.fill = "red";
          lovedItems.push(this.dataset.index);
          localStorage.setItem("lovedItems", JSON.stringify(lovedItems));
        }
      });
  }

  // adding eventListener to needed btns
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) =>
    card.addEventListener("click", function (e) {
      const index = this.closest(".card").dataset.index,
        itemQuantity = document.querySelector(
          `.card-product-counter[data-index='${index}']`
        );
      const addCart = e.target.closest(".card-image-add-to-cart");
      const increaseItem = e.target.closest(".card-product-increase-btn");
      const decreaseItem = e.target.closest(".card-product-decrease-btn");
      if (addCart?.className === "card-image-add-to-cart") {
        itemQuantity.textContent = 1;
        addToCart(data, index);
      } else if (decreaseItem?.className === "card-product-decrease-btn") {
        decreaseQuantityItem(data, index);
      } else if (increaseItem?.className === "card-product-increase-btn") {
        increaseQuantityItem(data, index);
      }
      // keep tracking cart so we can update it if an item added, deleted, increased/decreased quantity
      trackingCart();
    })
  );
}

// adding items from local storage to cart
function userSavedData(data) {
  const signContainer = document.querySelector("#sign-container");
  const icon = signContainer.querySelector("img");
  const text = signContainer.querySelector("span");
  if (localStorage.getItem("signed")) {
    icon.setAttribute("src", "./assets/images/logout.svg");
    text.textContent = "Logout";
  } else {
    icon.setAttribute("src", "./assets/images/login.svg");
    text.textContent = "Sign in";
  }
  signContainer.addEventListener("click", function () {
    if (localStorage.getItem("signed")) {
      localStorage.clear();
      location.reload();
    } else {
      window.location = "./sign.html";
    }
  });
  // fill cart with the previous user data of cart
  const fillCart = function () {
    if (!localStorage.getItem("cartItems")) return;
    cartItemsArr = JSON.parse(localStorage.getItem("cartItems"));
    cartItemsArr.forEach((item) => {
      addToCart(data, item.index);
      const quantityCounter = document.querySelector(
        `.quantity-counter[data-index='${item.index}']`
      );
      quantityCounter.setAttribute("data-count", "0");
      for (let counter = item.counter; counter > 0; counter--) {
        increaseQuantityItem(data, item.index);
      }
    });
    trackingCart();
  };
  //
  const fillLovedItems = function () {
    if (!localStorage.getItem("lovedItems")) return;
    lovedItems = JSON.parse(localStorage.getItem("lovedItems"));
    lovedItems.forEach((LovedItemIndex) => {
      const item = document.querySelector(
        `.loved-container[data-index="${LovedItemIndex}"]`
      );
      const icon = item.querySelector("svg");
      icon.style.fill = "red";
    });
  };
  fillCart();
  fillLovedItems();
}
