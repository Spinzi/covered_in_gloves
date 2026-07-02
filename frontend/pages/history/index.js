import { getDayIndexes } from "../../core/api.js";

function get_month_days(year, month){
    const first_day = new Date(year, month, 1);
    const last_day = new Date(year, month + 1, 0);
    const days_in_month = last_day.getDate();
    const start_weekday = first_day.getDay();

    return { days_in_month, start_weekday };
}

function format_key(year, month, day){
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}

function render_calendar(container, year, month, available_days){
    const available_set = new Set(available_days);

    const { days_in_month, start_weekday } = get_month_days(year, month);

    const month_name = new Date(year, month).toLocaleString('en-US', { month: 'long' });

    let html = `
        <div class="calendar_wrapper">
            <div class="calendar_header">
                <div class="calendar_nav">
                    <button class="btn--calendar" data-action="cal-year-prev">&laquo;</button>
                    <button class="btn--calendar" data-action="cal-prev">&lsaquo;</button>
                </div>
                <p>${month_name} ${year}</p>
                <div class="calendar_nav">
                    <button class="btn--calendar" data-action="cal-next">&rsaquo;</button>
                    <button class="btn--calendar" data-action="cal-year-next">&raquo;</button>
                </div>
            </div>
            <div class="calendar_grid">
    `;

    ["Su","Mo","Tu","We","Th","Fr","Sa"].forEach(d => {
        html += `<div class="calendar_weekday">${d}</div>`;
    });

    for(let i = 0; i < start_weekday; i++){
        html += `<div class="calendar_cell calendar_cell--empty"></div>`;
    }

    for(let day = 1; day <= days_in_month; day++){
        const key = format_key(year, month, day);
        const has_data = available_set.has(key);

        html += `
            <div class="calendar_cell ${has_data ? "calendar_cell--active card--clickable" : "calendar_cell--muted"}"
                 ${has_data ? `data-action="goDay-${key}"` : ""}>
                ${day}
            </div>
        `;
    }

    html += `</div></div>`;

    container.innerHTML = html;
}

export async function renderHistory(){
    var container = document.getElementById("content");

    container.innerHTML = `<h1>Quite an interesting choice, Administrator.</h1><p>Going back in time helps you analize the past, protecting you form making mistakes.</p>`;
    container.innerHTML += `<div id="history_div"></div>`;

    const resp = await getDayIndexes();

    if(resp["status"] !== "ok") return;

    const available_days = resp["data"]["indexes"];

    const history_div = document.getElementById("history_div");

    let current = new Date();
    let year = current.getFullYear();
    let month = current.getMonth();

    render_calendar(history_div, year, month, available_days);

    history_div.addEventListener("click", (e) => {
        const action = e.target.dataset.action;
        if(!action) return;

        if(action === "cal-prev"){
            month--;
            if(month < 0){ month = 11; year--; }
        } else if(action === "cal-next"){
            month++;
            if(month > 11){ month = 0; year++; }
        } else if(action === "cal-year-prev"){
            year--;
        } else if(action === "cal-year-next"){
            year++;
        } else {
            return; // goDay-* actions handled globally, ignore here
        }

        render_calendar(history_div, year, month, available_days);
    });
}