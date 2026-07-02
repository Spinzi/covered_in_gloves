import { getQuestions } from "../../core/api.js";
import { default_card } from "../../components/card/index.js";
import { basic_button } from "../../components/button/index.js";
import { select_input, long_text_input, short_text_input, initLongInputs } from "../../components/input/index.js";
import { state } from "../../core/state.js";

function render_server_response_card(){
    var container = document.getElementById("content");

    const card = default_card("feedback_card");

    card.innerHTML = `<p id="feedback_text"></p>`;

    card.style.display = "none";

    container.innerHTML += card.outerHTML;    
}

async function render_default(){
    var container = document.getElementById("content");

    let card = default_card();

    const header = document.createElement("h3");
    header.innerText = "Settings";

    card.appendChild(header);

    const question_card = default_card();
    const question_text = document.createElement("p");
    
    question_text.innerText = "Questions";
    question_card.appendChild(question_text);
    question_card.classList.add("card--clickable");
    question_card.dataset.action = "go_settings_questions";
    
    card.appendChild(question_card);

    console.log("Card");
    console.log(card.outerHTML);

    container.innerHTML += card.outerHTML;
}

async function render_questions_settings(){
    var container = document.getElementById("content");
    
    const server_resp = await getQuestions();

    const questions_from_server = server_resp["data"]["questions"];

    let card = default_card();

    const header = document.createElement("h3");
    header.innerText = "Questions";

    const add_q_card = default_card();
    const add_q_btn = basic_button(`go_settings_questions_add`, "Add question");

    const count = Object.keys(questions_from_server).length;
    add_q_card.innerHTML = `<h3>${count} ${count === 1 ? "question" : "questions"}.</h3>`;

    add_q_card.innerHTML += `<div style="margin-left: auto;"></div>`;

    add_q_card.innerHTML += add_q_btn;

    add_q_card.classList.add("question_card");

    card.appendChild(add_q_card);

    card.appendChild(header);

    for(const key in questions_from_server){
        const q_card = default_card();
        const el = questions_from_server[key];

        const delete_button = basic_button(`delete_q_${el["id"]}`, "Delete");
        const edit_button = basic_button(`edit_q_${el["id"]}`, "Edit");

        const q_data_card = default_card();

        q_card.classList.add("question_card");

        q_data_card.classList.add("question_card_data");

        q_data_card.innerHTML += `<p><span class="q_id">id:${el["id"]};</span> <span class="q_name">name:${el["name"]};</span> <span class="q_text">type:${el["type"]}</span></p>`;
        q_data_card.innerHTML += `<p>question:${el["text"]}`;

        q_card.appendChild(q_data_card);

        const buttons_card = default_card();

        buttons_card.classList.add("question_card_buttons");

        buttons_card.innerHTML += delete_button;
        buttons_card.innerHTML += edit_button;

        q_card.appendChild(buttons_card);

        card.appendChild(q_card);
            
    }
    
    container.innerHTML += card.outerHTML;

}

function add_question_main_data_render(type){
    const card = document.getElementById("add_question_main_card");

    if(type === "basic"){
        const q_text_name_label = document.createElement("h3");
        q_text_name_label.innerText = "Question name on server side:";
        const q_short_name_input = short_text_input("Type short server name", "question_name", "", "add_question_server_name");

        const q_text_label = document.createElement("h3");
        q_text_label.innerText = "Question:";
        const q_short_input = long_text_input("Type the question here", "question_name", "", "add_question_name");

        card.innerHTML += q_text_name_label.outerHTML;
        card.innerHTML += q_short_name_input;
        card.innerHTML += q_text_label.outerHTML;
        card.innerHTML += q_short_input;

        
    }
}

async function render_add_question(){
    var container = document.getElementById("content");

    //h spacer
    const h_spacer = `<div style = "margin-left: auto;"></div>`

    let card = default_card();

    const header = document.createElement("div");
    const header_text = document.createElement("h3");
    header_text.innerText = "Add question";
    const add_btn = basic_button("dashboard_add_question", "Add");

    header.appendChild(header_text);
    header.innerHTML += h_spacer;
    header.innerHTML += add_btn;
    header.style.display = "flex";
    header.style.flexDirection = "row";

    card.appendChild(header);

    //type card
    const type_of_question_card = default_card();
    const type_of_question_label = `<h3>Question type:</h3>`;
    const type_of_question_input = select_input("type", ["basic"], "basic", "add_question_type");

    type_of_question_card.innerHTML += type_of_question_label;
    type_of_question_card.innerHTML += h_spacer; 
    type_of_question_card.innerHTML += type_of_question_input;

    //main block

    const main_block = default_card("add_question_main_card");

    card.innerHTML += type_of_question_card.outerHTML;

    card.innerHTML += main_block.outerHTML;

    container.innerHTML += card.outerHTML;

    //NOTE THAT THIS WILL NEED TO BE UPDATE TO EACH TIME THE INPUT TYPE IS MODIFIED, CHANGE THIS TOO
    add_question_main_data_render("basic");
    
}

export async function renderDashboard(){
    var container = document.getElementById("content");

    container.innerHTML = `<h1>Administrator Dashboard</h1>`;

    //making the default settings page over here
    
    if(state.route.extras.questions === true){
        await render_questions_settings();
    }else if( state.route.extras.addQuestion === true){
        await render_add_question();
    }else{
        await render_default();
    }

    render_server_response_card()

    initLongInputs();

}