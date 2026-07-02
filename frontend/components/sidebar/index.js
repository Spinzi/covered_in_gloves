import { sidebarConfigAuth, sidebarConfigDefault, sidebarConfigWithSave } from "../../core/config.js";
import { sidebar_button } from "../button/index.js";
import { state } from "../../core/state.js";
import { default_card, sidebar_card } from "../card/index.js";

export function renderSidebar() {
  const el = document.querySelector("#sidebar");

  let config = {};

  if(state.route.page === "home" || state.route.page === "today"){
    config = sidebarConfigWithSave;
  }else if (state.route.page === "auth"){
    config = sidebarConfigAuth;
  }else{
    config = sidebarConfigDefault;
  }

  el.innerHTML = config.entries
    .map((item) => {
      switch (item.type) {
        case "button":
          return sidebar_button(item.action, item.label);
        case "space":
          return `<hr class="divider--sidebar" />`;
        case "header":
          let sidebar_card_obj = sidebar_card(); 
          const header = document.createElement("h3");
          header.textContent = item.label;
          sidebar_card_obj.appendChild(header);
          return sidebar_card_obj.outerHTML;
        case "message":
          return `<p class="sidebar--message">${item.label}</p>`;
        default:
          return "";
      }
    })
    .join("");
}
