const signForm = document.querySelector("form");
const invalidMessage = document.querySelector("#invalidMessage");
signForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(signForm);
  const formObject = {};
  const accountDetails = JSON.parse(localStorage.getItem("accountDetails"));
  formData.forEach((value, key) => (formObject[key] = value));
  console.log(formObject);
  if (
    formObject.email === accountDetails.email &&
    formObject.password === accountDetails.password
  ) {
    localStorage.setItem("signed", true);
    window.location = "./index.html";
  } else {
    invalidMessage.classList.remove("d-none");
  }
});
