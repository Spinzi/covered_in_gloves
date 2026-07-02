import { getDayIndexes } from "../../core/api.js";

export async function renderHistory(){
    var container = document.getElementById("content");

    container.innerHTML = `<h1>Quite an interesting choice, Administrator.</h1><p>Going back in time helps you analize the past, protecting you form making mistakes.</p>`;
    container.innerHTML += `<div id="history_div"></div>`;

    const resp = await getDayIndexes();

    console.log(resp);
    
}