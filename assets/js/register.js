const registerForm = document.querySelector("form");

registerForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(registerForm);
  const formObject = {};
  formData.forEach((value, key) => (formObject[key] = value));
  localStorage.setItem("accountDetails", JSON.stringify(formObject));
  window.location = "./sign.html";
});
