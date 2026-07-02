import { login, addQuestion, removeQuestion } from "./api.js";
import { state } from "./state.js";
import { saveToken } from "./storage.js";
import { goto } from "./router.js";
import { save } from "../utils/helpers.js";

export async function initActions(){

    document.body.addEventListener("click", async (event) => {
        const element = event.target.closest("[data-action]");

        if(!element) return;

        let action = element.dataset.action;

        if(action.startsWith("go-")){
            const dest = action.slice(3);
            goto(dest);
            return;
        }

        if(action.startsWith("delete_q_")){
            const q_id = action.slice(9);
            await removeQuestion(q_id);
            location.reload();
        }

        switch(action){
            case "login":
                console.log("Button pressed with action login.");

                let password = document.getElementById("password").value;

                const resp = await login(password);
                console.log("Raw resp:", resp);      // Is this undefined? Or never logged?
                console.log("Type:", typeof resp);

                const server_response_paragraph = document.getElementById("server_response");

                if(typeof resp === "object"){

                    if(resp.status === "error"){
                        server_response_paragraph.innerText = resp.error.code + ":" + resp.error.message;
                        server_response_paragraph.classList = "err_txt";
                    }
                    else if(resp.status === "ok"){
                        server_response_paragraph.innerText = "Welcome back, Administrator.";
                        server_response_paragraph.classList = "";
                        saveToken(resp.data.token);
                        state.token = resp.data.token;
                        goto("home");
                    }

                }

                break;
            case "go_settings_questions":
                goto("dashboard", {
                    questions: true
                });
                break;
            case "go_settings_questions_add":
                goto("dashboard", {
                    addQuestion: true
                });
                break;
            case "dashboard_add_question":

                //first fetch the required data
                const q_type = document.getElementById("add_question_type").value;
                const q_name = document.getElementById("add_question_server_name").value;
                const q_text = document.getElementById("add_question_name").value;

                const fdb_card = document.getElementById("feedback_card");
                const fdb_text = document.getElementById("feedback_text");

                if(q_text === "" || q_name === ""){
                    fdb_card.style.display = "flex";
                    fdb_text.innerText = "Cannot set empty question.";
                    fdb_text.classList = "err_txt";
                    break;
                }
                
                //send req to server

                const add_q_resp = await addQuestion(q_name, q_text, q_type);

                console.log(add_q_resp);

                //add an if here
                if(add_q_resp["status"] === "ok")
                {
                    fdb_card.style.display = "flex";
                    fdb_text.innerText = "Question added succesfully.";
                    fdb_text.classList = "ok_txt";
                    document.getElementById("add_question_server_name").value = "";
                    document.getElementById("add_question_name").value = "";
                    break;
                }

                if(add_q_resp["status"] !== "ok")
                {
                    fdb_card.style.display = "flex";
                    fdb_text.innerText = "Error, please visit console for more information.";
                    console.log(add_q_resp);
                    fdb_text.classList = "err_txt";
                    break;
                }

                fdb_card.style.display = "none";
                fdb_text.innerText = "";
                fdb_text.classList = "";
                break;
            case "save":
                save();
                break;
            default:
                console.log("Unregistered data-action");
        }
    });

}