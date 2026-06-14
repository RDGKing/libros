const url = "../libros/libro1.pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

let pdfDoc    = null;
let pageNum   = 1;
let zoom      = 1;
let rendering = false;

const canvas = document.getElementById("pdf-canvas");
const ctx    = canvas.getContext("2d");
const visor  = document.getElementById("contenedor-visor");

/* ─── RENDER ─────────────────────────────────────────── */

function getContainerWidth() {
    if (document.fullscreenElement) {
        return window.innerWidth * 0.95;
    }
    const wrap = document.querySelector(".canvas-wrap");
    return (wrap ? wrap.clientWidth : visor.clientWidth) - 24;
}

function renderPage(num) {
    if (rendering) return;
    rendering = true;

    pdfDoc.getPage(num).then(page => {

        canvas.style.opacity = "0";

        const maxWidth  = Math.min(getContainerWidth(), window.innerWidth * 0.95);
        const viewport0 = page.getViewport({ scale: 1 });
        const scale     = (maxWidth / viewport0.width) * zoom;
        const viewport  = page.getViewport({ scale });

        canvas.width  = viewport.width;
        canvas.height = viewport.height;

        page.render({ canvasContext: ctx, viewport }).promise.then(() => {
            canvas.style.opacity = "1";
            rendering = false;

            // Al cambiar página en fullscreen, volver al inicio del scroll
            const wrap = document.querySelector(".canvas-wrap");
            if (document.fullscreenElement && wrap) {
                wrap.scrollTop = 0;
            }
        });

        document.getElementById("page-num").textContent  = num;
        document.getElementById("btn-prev").disabled     = num <= 1;
        document.getElementById("btn-next").disabled     = num >= pdfDoc.numPages;
    });
}

/* ─── NAVEGACIÓN ─────────────────────────────────────── */

function prevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
}

function nextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPage(pageNum);
}

/* ─── BOTONES ────────────────────────────────────────── */

document.getElementById("btn-prev").addEventListener("click", prevPage);
document.getElementById("btn-next").addEventListener("click", nextPage);

document.getElementById("zoom-in").addEventListener("click", () => {
    zoom = Math.min(3, zoom + 0.2);
    renderPage(pageNum);
});

document.getElementById("zoom-out").addEventListener("click", () => {
    zoom = Math.max(0.4, zoom - 0.2);
    renderPage(pageNum);
});

document.getElementById("zoom-reset").addEventListener("click", () => {
    zoom = 1;
    renderPage(pageNum);
});

document.getElementById("btn-fullscreen").addEventListener("click", () => {
    if (!document.fullscreenElement) {
        visor.requestFullscreen().catch(err => {
            console.warn("No se pudo entrar en fullscreen:", err);
        });
    } else {
        document.exitFullscreen();
    }
});

/* ─── TECLADO ────────────────────────────────────────── */

document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   prevPage();
    if (e.key === "ArrowRight" || e.key === "ArrowDown") nextPage();
    if (e.key === "Escape" && document.fullscreenElement) document.exitFullscreen();
    if (e.key === "+" || e.key === "=") { zoom = Math.min(3, zoom + 0.2); renderPage(pageNum); }
    if (e.key === "-")                  { zoom = Math.max(0.4, zoom - 0.2); renderPage(pageNum); }
});

/* ─── RESIZE / FULLSCREEN CHANGE ─────────────────────── */

let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (pdfDoc) renderPage(pageNum);
    }, 150);
});

document.addEventListener("fullscreenchange", () => {
    const btn = document.getElementById("btn-fullscreen");

    if (document.fullscreenElement) {
        btn.textContent = "✕";
        btn.title = "Salir de pantalla completa";
    } else {
        btn.textContent = "⛶";
        btn.title = "Pantalla completa";
        zoom = 1;
    }

    setTimeout(() => { if (pdfDoc) renderPage(pageNum); }, 100);
});

/* ─── CARGA INICIAL ──────────────────────────────────── */

pdfjsLib.getDocument(url).promise.then(pdf => {
    pdfDoc = pdf;
    document.getElementById("page-count").textContent = pdf.numPages;
    renderPage(pageNum);
});