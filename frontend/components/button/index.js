export function basic_button( action, text, id="" ) {
    return `<button class="btn" data-action="${action}" id="${id}">${text}</button>`;
}

export function sidebar_button(action, text) {
    return `<button class="btn btn--sidebar" data-action="${action}">${text}</button>`;
}