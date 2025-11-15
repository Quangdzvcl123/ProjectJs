
const inputPasswordVerifyRegister = document.querySelector(".input-signup-passwordVerify");
const inputUsernameRegister = document.querySelector(".input-signup-username");
const inputPasswordRegister = document.querySelector(".input-signup-password");
const btnRegister = document.querySelector(".signup__signInButton");


function containsUppercase(str) {
  return /[A-Z]/.test(str);
}

function containsLowercase(str) {
  return /[a-z]/.test(str);
}


btnRegister.addEventListener("click", (e) => {
  e.preventDefault();

  const username = inputUsernameRegister.value.trim();
  const password = inputPasswordRegister.value;
  const passwordVerify = inputPasswordVerifyRegister.value;


  if (username === "" || password === "" || passwordVerify === "") {
    alert("Vui lòng không để trống");
    return;
  }

 
  if (username.length > 30) {
    alert("Username quá dài");
    return;
  }

  if (username.length < 6) {
    alert("Username quá ngắn");
    return;
  }

 
  if (passwordVerify !== password) {
    alert("Mật khẩu không khớp");
    return;
  }


  if (password.length < 8) {
    alert("Password quá ngắn");
    return;
  }

  if (password.length > 20) {
    alert("Password quá dài");
    return;
  }


  if (!containsUppercase(username)) {
    alert("Username phải có chữ cái in hoa");
    return;
  }

  if (!containsLowercase(username)) {
    alert("Username phải có chữ cái in thường");
    return;
  }


  if (localStorage.getItem(username)) {
    alert("Tên người dùng đã được đăng ký. Vui lòng dùng tên khác.");
    return;
  }


  const user = { username, password };
  localStorage.setItem(username, JSON.stringify(user));

  alert("Đăng ký thành công!");
  
});
