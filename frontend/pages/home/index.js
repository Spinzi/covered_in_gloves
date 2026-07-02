import { renderQuestions, autosaveInit } from "../../utils/helpers.js";

export function renderHome() {
  var container = document.getElementById("content");

  container.innerHTML = `<h1>Hello Administrator!</h1><p>Please answer the questions of today.</p>`;
  container.innerHTML += `<div id="question_div"></div>`;

  renderQuestions();
  autosaveInit();

}
