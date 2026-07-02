import { renderQuestions, autosaveInit } from "../../utils/helpers.js";

export function renderToday() {
  var container = document.getElementById("content");

  container.innerHTML = `<h1>I was waiting for you, Administrator!</h1><p>Please complete the questions of today!</p>`;
  container.innerHTML += `<div id="question_div"></div>`;

  renderQuestions();
  autosaveInit();

}
