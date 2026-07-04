import { basic_button } from "../../components/button/index.js";
import { short_text_input } from "../../components/input/index.js";
import { action_login } from "../../core/actions.js";

export function renderAuth() {
  var container = document.getElementById("content");

  container.innerHTML = `<h1>Welcome back, Administrator.</h1>`;

  container.innerHTML += `<p>Please enter your password to proceed.</p>`;

  container.innerHTML += short_text_input("Password", "password", "", "password");
  container.innerHTML += basic_button("login", "Log in", "login_btn");


  container.innerHTML += `<p id="server_response"></p>`;

  //add enter event listener
  document.getElementById("password").addEventListener("keydown", (event) => {
    console.log(event.key);
    if(event.key  === "Enter"){
      action_login();
    }
  });


}