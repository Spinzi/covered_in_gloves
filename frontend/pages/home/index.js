import { renderQuestions, autosaveInit, getGreeting } from "../../utils/helpers.js";
import { getDay, getDayIndexes } from "../../core/api.js";
import { state } from "../../core/state.js";

async function draw_stats(){

  const charts_div = document.getElementById("charts_div");

  charts_div.innerHTML = `<canvas id="first_canvas" class="stats_canvas"></canvas>`;

  const ctx_1 = document.getElementById("first_canvas");

  //rendering the firs stats - question answered all time

  let labels = [];
  let dataset_1_data = [];
  let data = {
    labels: null, //we set it later with labels
    datasets: [{
      label: "Questions checked with yes across days",
      data: null, // we set it later 
      fill: true,
      borderColor: `rgb(168, 28, 28)`, 
      pointBorderColor: `rgb(107, 16, 16)`,
      pointBackgroundColor: `rgb(107, 16, 16)`,
      pointBorderWidth: 5,
      tension: 0.1
    }]
  };

  //we have all days preloaded in state
  for(const key in state.days){
    const el = state.days[key];
    labels.push(el["date"]);

    let counter = 0;
    const day_questions = el["data"]["questions"];
    for(const day_question_key in day_questions){
      const day_question = day_questions[day_question_key];
      if(day_question["answer"]["value"])
        counter++;
    }

    dataset_1_data.push(counter);
  }

  data.labels = labels;
  data.datasets[0].data = dataset_1_data;

  console.log("GATTTTTTTTTT");
  console.log(data);

  const chart_1 = new Chart(ctx_1, {
    type: 'line',
    data: data
  });


}

export async function renderHome() {
  var container = document.getElementById("content");

  container.innerHTML = `<h1>${await getGreeting("home", "h")}</h>`;
  container.innerHTML += `<p>${await getGreeting("home", "p")}</p>`;
  container.innerHTML += `<div id="charts_div"></div>`;
  container.innerHTML += `<div id="question_div"></div>`;

  await draw_stats();
  renderQuestions();
  autosaveInit();

}
