import { getDay, getQuestions, getSettings, sendDay, getDayIndexes } from "../core/api.js";
import { default_card } from "../components/card/index.js";
import { checkbox_input, long_text_input, initLongInputs } from "../components/input/index.js";
import { state } from "../core/state.js";

let saveTimer = null;
let maxWaitTimer = null;
let secondsLeft = 3;
let countdownInterval = null;
const MAX_WAIT_MS = 20000; // force-save every 20s of continuous typing

export async function load_add_days(){
    console.log("Attempting to load all days...");

    const resp = await getDayIndexes();

    if(resp["status"] === "ok"){
        console.log("Server responded with status ok.");
        console.log("Proceeding to load all days in state...");

        for(const key in resp["data"]["indexes"]){
            const dt = resp["data"]["indexes"][key];

            const day = await getDay(dt);
            if(day["status"] === "ok"){
                console.log(`Succesfully got ${dt}...`);
                console.log(day);
                const day_data = day["data"]["day"];
                state.days[dt] = day_data;
            }
        }

        console.log("Loaded all days succesfully.");
        console.log(state.days);
    }else{
        console.warn("Could not load days. Resp status not ok.");
        console.warn(resp);
    }

}

export async function renderQuestions(){

    //get the day element under the date format as yyyy-mm-dd
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    console.log("Current date: ");
    console.log(date);

    //starting the whole questions thing
    let questions_div = document.getElementById("question_div");

    questions_div.innerHTML="";

    const question_resp = await getQuestions();
    const questions = question_resp["data"]["questions"];
    //update questions in settings with most recent data
    state.currentDay.questions = questions;

    const day_resp = await getDay(date);
    console.log(day_resp);

    console.log(question_resp);
    console.log(questions);

    for(const key in questions){
        let el = questions[key]
        console.log(el);

        const div = default_card();

        switch(el["type"]){
            case "basic":

                let checkbox_inp = checkbox_input("checkbox_input", `checkbox_${el["id"]}`, false);

                let long_answer_imp = long_text_input("Explain in long lines the details.", "long_answer", "", `long_answer_${el["id"]}`);
        
                if(day_resp["status"] === "ok"){
                    checkbox_inp = checkbox_input("checkbox_input", `checkbox_${el["id"]}`, day_resp["data"]["day"]["data"]["questions"][el["id"]]["answer"]["value"]);
                    long_answer_imp = long_text_input("Explain in long lines the details.", "long_answer", day_resp["data"]["day"]["data"]["questions"][el["id"]]["answer"]["text"][0]["text"], `long_answer_${el["id"]}`);
                    console.log(checkbox_inp);
                    console.log(long_answer_imp);
                }

                div.innerHTML += `
                <div class="question_header">
                    <h3>
                        <span class="card_id">${el["id"]}.</span>
                        ${el["text"]}
                    </h3>
        
                    <div class="horizontal_spacer"></div>
        
                    <p>Check if true:</p>
        
                    ${checkbox_inp}
                </div>
                `;
                div.innerHTML += `<br>`;
                div.innerHTML += long_answer_imp;

                

                break;
            default:
                console.warn("Unknown type ", el["type"]);
                break;
        }


        questions_div.appendChild(div);

    }

    initLongInputs();


}

async function send_save_to_server(){
    //to be revised to accept updates and shit
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    console.log(now);

    let server_packet = {
        "date": `${now.getFullYear()}-${mm}-${dd}`,

        "data": {
            questions: state.currentDay.questions,
        },

        "meta": {
            "created_at": now.toISOString(),
            "updated_at": now.toISOString(),
            "version": 1
        }
    }

    const resp = await sendDay(server_packet);
    console.log(server_packet);
    console.log(resp);

}

export async function save(){
    console.log("Proceeding to save the current day.");

    for(const key in state.currentDay.questions){

        const q_data = state.currentDay.questions[key];

        console.log(`ID: ${q_data["id"]}, TYPE: ${q_data["type"]}`);

        //fetch the answers

        switch(q_data["type"]){
            case "basic":

                const checkbox_input_value = document.getElementById(`checkbox_${q_data["id"]}`).checked;
                const text_input_value = document.getElementById(`long_answer_${q_data["id"]}`).value;

                console.log(checkbox_input_value);
                console.log(text_input_value);

                state.currentDay.questions[q_data["id"]] = {
                    "id": q_data["id"],
                    "name": q_data["name"],
                    "type": q_data["type"],
                    "answer": {
                        "value": checkbox_input_value,
                        "text" : [
                            { 
                                "type": "p",
                                "text": text_input_value
                            }
                        ],
                        "meta":{}
                    }
                }

                break;
            default:
                console.warn(`Unknown question type is present. Case:${q_data["type"]}`);
                console.warn(`Data inside the question that created the unknown error: ${q_data}`);
                break;
        }

        console.log(state.currentDay);
    }

    await send_save_to_server();
}

export async function autosaveInit(){
    document.addEventListener("input", (event) => {
        if(!event.target.matches("input, textarea")) return;

        document.getElementById("autosave_to_show").style.display = "inline";

        clearTimeout(saveTimer);
        clearInterval(countdownInterval);

        secondsLeft = 3;
        document.getElementById("autosave").textContent = `Autosave in ${secondsLeft} seconds`;

        countdownInterval = setInterval(() => {
            secondsLeft--;
            if(secondsLeft > 0){
                document.getElementById("autosave").textContent = `Autosave in ${secondsLeft} seconds`;
            } else {
                clearInterval(countdownInterval);
            }
        }, 1000);

        saveTimer = setTimeout(doSave, 3000);

        // only start the ceiling timer if one isn't already running
        if(!maxWaitTimer){
            maxWaitTimer = setTimeout(doSave, MAX_WAIT_MS);
        }
    });

    async function doSave(){
        clearTimeout(saveTimer);
        clearTimeout(maxWaitTimer);
        maxWaitTimer = null;

        document.getElementById("autosave").textContent = `Saving...`;
        await save();
        document.getElementById("autosave").textContent = `Saved`;
    }
}