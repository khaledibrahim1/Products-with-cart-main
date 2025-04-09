"use strict";
const tableBody = document.querySelector("tbody");
const sliderContainer = document.querySelector(".swiper-wrapper");
const checkoutBtn = document.querySelector(".checkout-btn");
const checkoutInvalidMessage = document.querySelector(".checkout-noItems");

fetch("./data.json")
  .then((response) => response.json())
  .then((data) => {
    addCartItems(data);
    addLovedItems(data);
  })
  .catch((error) => console.error("error fetching data:", error));

let cartItemsArr = JSON.parse(localStorage.getItem("cartItems")),
  lovedItems = JSON.parse(localStorage.getItem("lovedItems"));

function trackBagCart() {
  const bagCounter = document.querySelector(".cart-icon-counter");
  let counter = 0;
  cartItemsArr.forEach((item) => (counter += Number(item.counter)));
  bagCounter.textContent = counter;
}

function calculateTotalSummary() {
  const totalSummary = document.querySelector(".total-summary");
  let total = 0;
  cartItemsArr.forEach((item) => (total += item.itemPrice * item.counter));
  totalSummary.textContent = total.toFixed(2);
}

function addCartItems(data) {
  if (!cartItemsArr) return;
  tableBody.innerHTML = "";
  cartItemsArr.forEach((item) => {
    tableBody.insertAdjacentHTML(
      "beforeend",
      `<tr>
                <td class="d-flex gap-3 text-start align-items-center">
                  <img src="${data[item.index].image.thumbnail}" alt="" />
                  <div class="item-text-container my-auto">
                    <p class="fs-6 mb-0">${data[item.index].category}</p>
                    <small>${data[item.index].name}</small>
                  </div>
                </td>
                <td>
                  <div
                    class="d-flex gap-1 justify-content-center align-items-center"
                  >
                    <input
                      type="number"
                      value="${item.counter}"
                      data-index="${item.index}"
                      class="w-25 quantity-input text-center"
                    />
                  </div>
                </td>
                <td>$${data[item.index].price.toFixed(2)}</td>
                <td class="item-total">$${(
                  Number(data[item.index].price) * Number(item.counter)
                ).toFixed(2)}</td>
                <td>
                  <span class="btn fs-2 p-0 delete-btn" data-index="${
                    item.index
                  }">&times;</span>
                </td>
              </tr>`
    );
  });
  trackBagCart();
  calculateTotalSummary();
}

function addLovedItems(data) {
  console.log(lovedItems);
  if (!lovedItems) return;
  sliderContainer.innerHTML = "";

  lovedItems.forEach((itemUniqueIndex) => {
    const cardHtml = `<div class="swiper-slide">
              <div class="card">
              <svg
              data-index="${itemUniqueIndex}"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="red"
                  class="bi bi-suit-heart-fill"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1"
                  ></path>
                </svg>
                <img
                  src="${data[itemUniqueIndex].image.mobile}"
                  alt="Card Image 1"
                />
                <div class="card-body">
                  <h5 class="card-title">${data[itemUniqueIndex].category}</h5>
                  <p class="card-description">
                    ${data[itemUniqueIndex].name}
                  </p>
                </div>
              </div>
            </div>`;
    sliderContainer.insertAdjacentHTML("beforeend", cardHtml);
  });
  sliderContainer.addEventListener("click", function (e) {
    const clickedItem = e.target.closest("svg");
    console.log(clickedItem);
    if (!clickedItem || clickedItem.nodeName != "svg") return;

    const uniqueIndex = clickedItem.dataset.index;
    const arrIndex = lovedItems.findIndex(
      (itemIndex) => itemIndex == uniqueIndex
    );

    if (clickedItem.getAttribute("fill") == "red") {
      lovedItems.splice(arrIndex, 1);
      clickedItem.setAttribute("fill", "#808080");
    } else {
      console.log("Item is added to favorite");
      lovedItems.push(uniqueIndex);
      clickedItem.setAttribute("fill", "red");
    }

    localStorage.setItem("lovedItems", JSON.stringify(lovedItems));
  });
}

function handleSign() {
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
      window.location = "./index.html";
    } else {
      window.location = "./sign.html";
    }
  });
}

// Event Handlers
tableBody.addEventListener("click", function (e) {
  if (!e.target.classList.contains("delete-btn")) return;

  const itemUniqueIndex = e.target.dataset.index;
  const arrIndex = cartItemsArr.findIndex(
    (item) => item.index === itemUniqueIndex
  );
  cartItemsArr.splice(arrIndex, 1);
  localStorage.setItem("cartItems", JSON.stringify(cartItemsArr));
  location.reload();
});

tableBody.addEventListener("input", function (e) {
  const itemUniqueIndex = e.target.dataset.index;
  const arrIndex = cartItemsArr.findIndex(
    (item) => item.index === itemUniqueIndex
  );
  const totalItem = e.target.closest("tr").querySelector(".item-total");
  if (e.target.value <= 0) {
    e.target.value = 1;
  }
  cartItemsArr[arrIndex].counter = e.target.value;

  totalItem.textContent = `$${(
    e.target.value * cartItemsArr[arrIndex].itemPrice
  ).toFixed(2)}`;

  trackBagCart();
  calculateTotalSummary();
  localStorage.setItem("cartItems", JSON.stringify(cartItemsArr));
});

checkoutBtn.addEventListener("click", function (e) {
  if (!localStorage.getItem("signed")) {
    window.location = "./sign.html";
    return;
  } else if (cartItemsArr.length == 0) {
    checkoutInvalidMessage.classList.remove("d-none");
    return;
  }
  localStorage.setItem("checkout", true);
  window.location = "./index.html";
});

// Main
(function () {
  handleSign();
  // Initialize Swiper
  const swiper = new Swiper(".swiper-container", {
    loop: false, // No looping of slides
    slidesPerView: 3, // Show 3 cards at once
    spaceBetween: 0, // Space between the cards
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      576: {
        slidesPerView: 2, // 1 card on small screens
      },
      992: {
        slidesPerView: 3, // 3 cards on larger screens
      },
    },
  });
})();
