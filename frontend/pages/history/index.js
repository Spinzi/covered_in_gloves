import { getDayIndexes } from "../../core/api.js";
import { default_card } from "../../components/card/index.js";

function render_days(days){
    const container = document.getElementById("history_div");
    
    const sorted_days = [...days].sort((a, b) => b.localeCompare(a));


    for(const key in sorted_days){

        const day = sorted_days[key];

        const card = default_card("");
        const name = `<p>${day}</p>`;

        card.dataset.action = `goDay-${day}`;

        card.classList.add("card--clickable");

        card.innerHTML = name;

        container.innerHTML += card.outerHTML;
    }
}

export async function renderHistory(){
    var container = document.getElementById("content");

    container.innerHTML = `<h1>Quite an interesting choice, Administrator.</h1><p>Going back in time helps you analize the past, protecting you form making mistakes.</p>`;
    container.innerHTML += `<div id="history_div"></div>`;

    const resp = await getDayIndexes();

    if(resp["status"] === "ok"){
        render_days(resp["data"]["indexes"]);
    }
    
}