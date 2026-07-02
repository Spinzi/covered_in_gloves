import { state } from "../core/state.js";
import { login, check_token } from "../core/api.js"

export async function is_authenticated() {
    
    console.log("Attempting to log in...");
    console.log("Current token:", state.token)

    if (state.token === null) {
        console.log("Current token was found out to be null.");
        return false;
    }


    let resp = await check_token(state.token);

    console.log(resp);

    return resp.status == 'ok';
}