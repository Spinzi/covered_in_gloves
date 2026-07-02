export function renderTopbar() {
  const el = document.getElementById("topbar");

  el.innerHTML = `
        <div class="topbar">
                <h2>Covered in gloves - written by Spinzi</h2>
                <div style="margin-left:auto;"></div>
                <p><span id="autosave"></span><span id="autosave_to_show" style="display:none;"> | </span><span id="clock">--:--:--</span></p>
        </div>
    `;

    function tickClock() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");
        document.getElementById("clock").textContent = `${hh}:${mm}:${ss}`;

        const msToNextSecond = 1000 - now.getMilliseconds();
        setTimeout(tickClock, msToNextSecond);
    }
    tickClock();
}
