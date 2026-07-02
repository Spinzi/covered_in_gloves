import { state } from "../../core/state.js"
import { getDay } from "../../core/api.js";
import { default_card } from "../../components/card/index.js";
import { basic_button } from "../../components/button/index.js";

function day_err(){
    const el = document.getElementById("day_div");
    el.innerHTML = `<p class="err_txt">Error</p>`;
}

function formatDate(isoString) {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function show_day(data){
    console.log("show day shit");
    const main_div = document.getElementById("day_div");

    const data_card = default_card();

    const questions_card = default_card();

    //data card, save_ver, created_at, uptaded_at, date
    
    data_card.innerHTML = `
        <p>Date: ${data["date"]}</p>
        <p>Meta:</p>
        <p class="q_id text--indent">Created at: ${formatDate(data["meta"]["created_at"])}</p>
        <p class="q_name text--indent">Updated at: ${formatDate(data["meta"]["updated_at"])}</p>
        <p class="q_text text--indent">Save version: ${data["meta"]["version"]}</p>
    `;

    //questions 

    questions_card.innerHTML = `
        <h3>Questions</h3>
    `;

    for(const key in data["data"]["questions"]){//BUILT ONLY FOR BASIC ANSWERS
        const el = data["data"]["questions"][key];

        const q_card = default_card();

        q_card.innerHTML = `

            <p><span class="q_id">id:${el["id"]};</span> <span class="q_name">name:${el["name"]};</span> <span class="q_text">type:${el["type"]}</span></p>
            
            
            <p>Answer:</p>
            
            <p class="text--indent">Checkend: ${el["answer"]["value"]}</p>
            <p class="text--indent">Long answer: ${el["answer"]["text"][0]["text"] || `<span style="color:var(--text-muted);display:inline;">Empty text</span>`}</p>

        `


        questions_card.innerHTML += q_card.outerHTML;
    }

    main_div.innerHTML += data_card.outerHTML;
    main_div.innerHTML += questions_card.outerHTML;

}

export async function renderDay(){
    //getting the date
    const date = state.route.date;
    console.log(`Entering loading of day ${date}`);
    //fetching 
    const day_fetch = await getDay(date);
    console.log(day_fetch)

    //building page
    var container = document.getElementById("content");

    container.innerHTML = `<h1>Its nice to look back, Administrator.</h1><p>Lets see what you did.</p>`;
    container.innerHTML += `<div id="day_div"></div>`;

    if(day_fetch["status"] === "ok"){
        show_day(day_fetch["data"]["day"]);
    }else{
        day_err();
    }
}