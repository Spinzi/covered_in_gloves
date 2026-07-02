export function short_text_input(placeholder, name, value = "", id) {
    return `<input type="text" class="input input--short" placeholder="${placeholder}" name="${name}" value="${value}" id="${id}">`;
}

export function long_text_input(placeholder, name, value = "", id) {
    return `<textarea class="input input--long" placeholder="${placeholder}" name="${name}" id="${id}" rows="1">${value}</textarea>`;
}

export function checkbox_input(name, id, checked = false) {
    return `<input type="checkbox" class="input input--checkbox" name="${name}" id="${id}" ${checked ? "checked" : ""}>`;
}

export function select_input(name, options, value = "", id) {
    const optionsHtml = options
        .map(opt => {
            const optValue = typeof opt === "object" ? opt.value : opt;
            const optLabel = typeof opt === "object" ? opt.label : opt;
            const selected = optValue === value ? "selected" : "";
            return `<option value="${optValue}" ${selected}>${optLabel}</option>`;
        })
        .join("");

    return `<select class="input input--select" name="${name}" id="${id}">${optionsHtml}</select>`;
}

// Simple strings
// select_input("color", ["red", "green", "blue"], "green", "color-pick");

// Object pairs (value/label)
// select_input("status", [
//     { value: "1", label: "Active" },
//     { value: "0", label: "Inactive" }
// ], "1", "status-select");

export function initLongInputs() {
    document.querySelectorAll(".input--long:not([data-init])").forEach(el => {
        el.dataset.init = "true";
        el.style.height = el.scrollHeight + "px";

        el.addEventListener("input", () => {
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
        });
    });
}