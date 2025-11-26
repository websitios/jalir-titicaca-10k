// ============================================================
//   CONTADOR JALIR TITICACA 10K – CON DÍAS + HORAS TOTALES 🔥
//   (Tiempo real por Internet + respaldo manual)
// ============================================================

// Fecha oficial del evento
const FechaEvento = new Date("Nov 30, 2025 08:00:00").getTime();

// ===============================
//   VALORES BACKUP (modo offline)
// ===============================
let dias = 4;
let horasTotales = 104;
let minutos = 0;
let segundos = 0;

// ============================================================
//   HORA REAL POR INTERNET 🌎
// ============================================================
let offset = null;

async function sincronizarHora() {
    try {
        const r = await fetch("https://worldtimeapi.org/api/timezone/America/Lima");
        const d = await r.json();
        offset = new Date(d.datetime).getTime() - Date.now();
        console.log("%c✔ Hora sincronizada con internet", "color:#00ff88;font-size:14px");
    } catch {
        console.log("%c⚠ Sin conexión — Modo manual activo", "color:yellow;font-size:14px");
    }
}
sincronizarHora();
setInterval(sincronizarHora, 600000);



// ============================================================
//  EFECTO POP EN NÚMEROS
// ============================================================
function animar(id, valor) {
    const el = document.getElementById(id);
    if (el.textContent !== valor.toString()) {
        el.textContent = valor;
        el.classList.add("change");
        setTimeout(() => el.classList.remove("change"), 300);
    }
}



// ============================================================
//   CONTADOR EN VIVO
// ============================================================
function actualizarContador() {

    // MODO ONLINE (tiempo exacto)
    if (offset !== null) {
        const ahora = Date.now() + offset;
        const diff = FechaEvento - ahora;
        if (diff <= 0) return;

        dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        horasTotales = Math.floor(diff / (1000 * 60 * 60));
        minutos = Math.floor((diff / (1000 * 60)) % 60);
        segundos = Math.floor((diff / 1000) % 60);
    }

    // MODO MANUAL (si no hay internet)
    else {
        segundos--;
        if (segundos < 0) { segundos = 59; minutos--; }
        if (minutos < 0) { minutos = 59; horasTotales--; }
        if (horasTotales % 24 === 0 && minutos === 0 && segundos === 0) dias--;
    }

    animar("days", dias);
    animar("hours", horasTotales);
    animar("minutes", minutos);
    animar("seconds", segundos);
}


// Ejecutar continuamente
actualizarContador();
setInterval(actualizarContador, 1000);


// ============================================================
//   EFECTO CLICK EN BOTONES
// ============================================================
const botones = document.querySelectorAll(".btn--primary, .btn--secondary");
botones.forEach(boton => {
    boton.addEventListener("click", function () {
        botones.forEach(b => b.classList.remove("active"));
        this.classList.add("active");
    });
});



// ============================================================
//   MODO EVENTO PRO – SE ACTIVA SOLO SEGÚN FALTAN DÍAS 🔥
// ============================================================
function activarModoEvento() {
    const body = document.querySelector("body");
    const titulo = document.querySelector(".promo__title");
    const subtitulo = document.querySelector(".promo__text");

    if (!body) return;

    body.style.transition = "0.7s";

    if (dias > 5) {
        body.style.filter = "brightness(1)";
    }
    else if (dias <= 5 && dias >= 3) {
        body.style.filter = "brightness(1.04)";
    }
    else if (dias === 2) {
        body.style.filter = "brightness(1.1) contrast(1.1)";
        titulo.style.animation = "shake 1.5s infinite";
    }
    else if (dias === 1) {
        body.style.filter = "brightness(1.25)";
        titulo.innerHTML = "🔥 ¡Mañana corremos! No quedes fuera";
        titulo.style.animation = "heartbeat 1s infinite";
    }
    else if (dias === 0) {
        body.style.filter = "brightness(1.3)";
        titulo.innerHTML = "🏁 EVENTO EN VIVO — RESULTADOS Y STREAMING";
        subtitulo.innerHTML = "Actualización en tiempo real";
        titulo.style.animation = "flash 0.6s infinite";
    }
}
setInterval(activarModoEvento, 1000);

// ============================================================
//  🌙 MODO OSCURO – CLARO AUTOMÁTICO
// ============================================================

const toggle = document.getElementById("tema-toggle");

// Cargar estado guardado
if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark-mode");
    toggle.textContent = "☀️";
}

// Evento de cambio de tema
toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        toggle.textContent = "☀️";
        localStorage.setItem("tema", "dark");
    } else {
        toggle.textContent = "🌙";
        localStorage.setItem("tema", "light");
    }
});

// ============================================================
//  EFECTO HOVER EN REDES SOCIALES – LUZ POR MARCA 🔥
// ============================================================

const redes = document.querySelectorAll(".social__icons a i");

redes.forEach(icon => {
    icon.addEventListener("mouseover", () => {
        if (icon.classList.contains("fa-facebook-f")) icon.style.color = "#1877F2";      // Facebook
        if (icon.classList.contains("fa-tiktok")) icon.style.color = "#181617ff";      // TikTok
        if (icon.classList.contains("fa-instagram")) icon.style.color = "#ea413fff";      // Instagram
        if (icon.classList.contains("fa-youtube")) icon.style.color = "#FF0000";      // YouTube

        icon.style.transform = "scale(1.3)";
        icon.style.transition = "0.25s";
        icon.style.textShadow = "0 0 12px rgba(255,255,255,.8)";
    });

    icon.addEventListener("mouseout", () => {
        icon.style.color = "#fff";       // ← vuelve blanco (estilo original)
        icon.style.transform = "scale(1)";
        icon.style.textShadow = "none";
    });
});


// ============================================================
// 🔰 BOTÓN WHATSAPP FLOTANTE CON MOVIMIENTO SEGÚN SCROLL
// ============================================================
const wpp = document.querySelector(".whatsapp-float");

window.addEventListener("scroll", () => {
    let y = window.scrollY * 0.12; // ← velocidad del movimiento (ajustable)
    wpp.style.transform = `translateY(${y}px)`;
    wpp.style.transition = "0.2s linear";
});
