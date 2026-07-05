import { renderQuestions, autosaveInit, getGreeting } from "../../utils/helpers.js";

export async function renderToday() {
  var container = document.getElementById("content");
  container.innerHTML = `<h1>${await getGreeting("today", "h")}</h1><p>${await getGreeting("today", "p")}</p>`;
  container.innerHTML += `<div id="question_div"></div>`;

  renderQuestions();
  autosaveInit();

}
