fetch("/loginlogout")
  .then((response) => response.json())
  .then((userIsLoggedIn) => {
    // console.log(userIsLoggedIn); // logs { name: 'John', age: 30 }
    // do something with the data

    var loginSignup = document.getElementById("ul_login_signup");
    if (userIsLoggedIn) {
      // Get the parent element of the "Login" and "Sign Up" list items

      // Get the "Login" and "Sign Up" list items
      var loginLi = document.getElementById("loginLI");
      var signupLi = document.getElementById("signupLI");
      console.log("weeeee");
      // Remove the "Login" and "Sign Up" list items from the DOM
      loginSignup.removeChild(loginLi);
      loginSignup.removeChild(signupLi);
    } else {
        var afterlogin = document.getElementById("after-login");
        loginSignup.removeChild(afterlogin);
      console.log("WEWEQWASDFAS");
    }
  });
