export function basic_button( action, text ) {
    return `<button class="btn" data-action="${action}">${text}</button>`;
}

export function sidebar_button(action, text) {
    return `<button class="btn btn--sidebar" data-action="${action}">${text}</button>`;
}