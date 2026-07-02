import { state } from "./state.js"

export function parseRoute(){
    const params = new URLSearchParams(window.location.search);

    //link will look like blablabla.com/?page=day&date=2026-21-15 or whatever
    state.route = {
        page: params.get("page") || "home",
        date: params.get("date"),
        extras: {
            questions: params.has("questions"),
            addQuestion: params.has("addQuestion"),
            returnTo: params.get("returnTo"),

        }
    }

    console.log(`Parsed route `);
    console.log(state.route);
}

export function goto(page, extra = {}){
    const params = new URLSearchParams();

    params.set("page", page);

    for(const [key, value] of Object.entries(extra)){
        if (value !== null && value !== undefined){
            params.set(key, value);
        }
    }

    window.location.href = `?${params.toString()}`;
}