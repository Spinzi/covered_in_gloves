import { renderTopbar } from "./components/topbar/index.js";
import { renderSidebar } from "./components/sidebar/index.js";
import { renderHome } from "./pages/home/index.js";
import { renderDashboard } from "./pages/dashboard/index.js";
import { renderToday } from "./pages/today/index.js";
import { renderHistory } from "./pages/history/index.js";

import { is_authenticated } from "./utils/validation.js";

import { state } from "./core/state.js";

import { getToken } from "./core/storage.js";
import { renderAuth } from "./pages/auth/index.js";

import { initActions } from "./core/actions.js";

import { WEBSOCKET_URL } from "./core/config.js";
import { initAPI } from "./core/api.js";
import { waitForSocket } from "./core/socket.js";

import { parseRoute, goto } from "./core/router.js";

// the init function is called when the DOM is fully loaded
// we need to auth the user first, so we will call the check auth
// based on the state, we will render the appropriate page (auth, home, dashboard, history, etc.)

async function init() {

  initAPI(WEBSOCKET_URL);

  await waitForSocket();

  state.token = await getToken();
  
  console.log("Starting...");
  console.log("Token:", state.token);

  console.log(state);

  parseRoute();

  console.log(state);


  if(!(await is_authenticated()) && state.route.page !== "auth"){
    goto("auth");
  }

  renderTopbar();
  renderSidebar();

  console.log(`Entering loading specific page phase - current page is : ${state.route.page}`);

  switch(state.route.page){
    
    case "auth":
      console.log("Entering auth rendering...");
      renderAuth();
      break;
    case "home":
      console.log("Entering home rendering...");
      renderHome();
      break;
    case "dashboard":
      console.log("Entering dashboard rendering...");
      renderDashboard();
      break;
    case "today":
      console.log("Entering today rendering...");
      renderToday();
      break;
    case "history":
      renderHistory();
      break;
    default:
      break;

  }

  initActions();

}

document.addEventListener("DOMContentLoaded", (event) => {
  init();
});
