import { connect, send } from "./socket.js"
import { state } from "./state.js";

let handlers = {};

export function initAPI(url){
    console.log("initAPI...");
    connect(url, (msg) => {
        const list = handlers[msg.action];

        if (list && list.length > 0) {
            list.forEach(fn => fn(msg));
        } else {
            console.warn("No handler for:", msg.action);
            console.log("Current handlers:", handlers);
        }
    });
}

function on(action, callback) {
    if (!handlers[action]) handlers[action] = [];
    handlers[action].push(callback);

    return () => {
        handlers[action] = handlers[action].filter(x => x !== callback);
    };
}

function once(action) {
    return new Promise((resolve) => {
        const off = on(action, (data) => {
            off();
            resolve(data);
        });
    });
}

export async function login(password) {
    send({
        action: "auth:login",
        data: { password }
    });

    return await once("auth:login");
}

export async function check_token(token) {
    send({
        action: "auth:check",
        data: { token }
    });

    return await once("auth:check");
}

export async function getQuestions(){
    send({
        action: "question:get",
        data: {
            "token": state.token
        }
    });

    return await once("question:get");
}

export async function getSettings(){
    send({
        action: "settings:get",
        data: {
            "token": state.token
        }
    });

    return await once("settings:get");
}

export async function addQuestion(name, text, type){
    send({
        action: "question:add",
        data: {
            "token": state.token,
            "question": {
                "name": name,
                "text": text,
                "type": type,
                meta: {

                }
            }
        }
    });

    return await once("question:add");
}

export async function removeQuestion(id){
    send({
        action: "question:remove",
        data: {
            "token": state.token,
            "qid": id
        }
    });

    return await once("question:remove");
}

export async function sendDay(day){
    send({
        action: "day:set",
        data: {
            token: state.token,
            day: day
        }
    });

    return await once("day:set");
}

export async function getDay(date){
    send({
        action: "day:get",
        data: {
            token: state.token,
            date: date
        }
    });

    return await once("day:get");
}

export async function getDayIndexes(){
    send({
        action: "day:get_indexes",
        data: {
            token: state.token,
        }
    });

    return await once("day:get_indexes");
}

export async function logout(){
    send({
        action: "auth:logout",
        data: {
            token: state.token
        }
    });

    return await once("auth:logout");
}