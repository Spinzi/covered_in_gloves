import { renderTopbar } from "./components/topbar/index.js";
import { renderSidebar } from "./components/sidebar/index.js";
import { renderHome } from "./pages/home/index.js";
import { renderDashboard } from "./pages/dashboard/index.js";
import { renderToday } from "./pages/today/index.js";
import { renderHistory } from "./pages/history/index.js";
import { renderDay } from "./pages/day/index.js";

import { is_authenticated } from "./utils/validation.js";

import { state } from "./core/state.js";

import { getToken } from "./core/storage.js";
import { renderAuth } from "./pages/auth/index.js";

import { initActions } from "./core/actions.js";

import { WEBSOCKET_URL } from "./core/config.js";
import { initAPI } from "./core/api.js";
import { waitForSocket } from "./core/socket.js";

import { parseRoute, goto } from "./core/router.js";
import { load_add_days } from "./utils/helpers.js";

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
    goto("auth", {
      returnTo: window.location.search || null
    });
  }

  renderTopbar();
  renderSidebar();

  console.log(`Entering loading specific page phase - current page is : ${state.route.page}`);

  switch(state.route.page){
    
    case "auth":
      renderAuth();
      break;
    case "home":
      await load_add_days();
      renderHome();
      break;
    case "dashboard":
      renderDashboard();
      break;
    case "today":
      renderToday();
      break;
    case "history":
      renderHistory();
      break;
    case "day":
      renderDay();
      break;
    default:
      break;

  }

  initActions();

}

document.addEventListener("DOMContentLoaded", async (event) => {
  await init();
});
