export function default_card(id=""){
    let card = document.createElement("div");
    card.id = id;
    card.classList.add("card");

    return card;
}

export function sidebar_card(id=""){
    let card = document.createElement("div");
    card.id = id;
    card.classList.add("card");
    card.classList.add("card--sidebar");

    return card;
}