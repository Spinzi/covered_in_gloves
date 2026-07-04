import { renderQuestions, autosaveInit, getGreeting } from "../../utils/helpers.js";

export async function renderHome() {
  var container = document.getElementById("content");

  container.innerHTML = `<h1>${await getGreeting("home", "h")}</h>`;
  container.innerHTML += `<p>${await getGreeting("home", "p")}</p>`;
  container.innerHTML += `<div id="question_div"></div>`;

  renderQuestions();
  autosaveInit();

}
