const $ = (id) => document.getElementById(id);
const esc = (t) => String(t).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Abas ---------- */
const abas = { musicas: $("btnMusicas"), artistas: $("btnArtistas"), albuns: $("btnAlbuns") };

function mostrar(nome) {
  for (const [id, botao] of Object.entries(abas)) {
    $(id).hidden = id !== nome;
    botao.classList.toggle("ativo", id === nome);
  }
}
for (const [id, botao] of Object.entries(abas)) {
  botao.addEventListener("click", () => mostrar(id));
}

/* ---------- API Deezer (JSONP: evita o problema de CORS) ---------- */
function jsonp(url) {
  return new Promise((ok, falha) => {
    const nome = "dz" + Date.now();
    const s = document.createElement("script");
    const limpar = () => { delete window[nome]; s.remove(); };
    window[nome] = (dados) => { limpar(); ok(dados); };
    s.onerror = () => { limpar(); falha(new Error("Sem ligação")); };
    s.src = `${url}${url.includes("?") ? "&" : "?"}output=jsonp&callback=${nome}`;
    document.body.appendChild(s);
  });
}

let faixas = [];
let atual = -1;

async function carregar(url, titulo) {
  $("tituloLista").textContent = titulo;
  $("listaMusicas").innerHTML = '<p class="msg">A carregar...</p>';
  try {
    const dados = await jsonp(url);
    faixas = (dados.data || []).filter((m) => m.preview);
    atual = -1;
    desenhar();
  } catch {
    $("listaMusicas").innerHTML = '<p class="msg">Não foi possível carregar. Verifica a internet e tenta de novo.</p>';
  }
}

function desenhar() {
  if (!faixas.length) {
    $("listaMusicas").innerHTML = '<p class="msg">Nenhum resultado. Tenta outro nome.</p>';
    $("listaArtistas").innerHTML = "";
    $("listaAlbuns").innerHTML = "";
    return;
  }

  $("listaMusicas").innerHTML = faixas.map((m, i) => `
    <button class="faixa" data-i="${i}">
      <img src="${esc(m.album.cover_small)}" alt="">
      <span class="t"><b>${esc(m.title)}</b><small>${esc(m.artist.name)}</small></span>
    </button>`).join("");

  const artistas = new Map(faixas.map((m) => [m.artist.id, m.artist]));
  $("listaArtistas").innerHTML = [...artistas.values()].map((a) => `
    <div class="cartao art"><img src="${esc(a.picture_medium)}" alt=""><p>${esc(a.name)}</p></div>`).join("");

  const albuns = new Map(faixas.map((m) => [m.album.id, m]));
  $("listaAlbuns").innerHTML = [...albuns.values()].map((m) => `
    <div class="cartao"><img src="${esc(m.album.cover_medium)}" alt="">
      <p>${esc(m.album.title)}</p><small>${esc(m.artist.name)}</small></div>`).join("");
}

$("listaMusicas").addEventListener("click", (e) => {
  const item = e.target.closest(".faixa");
  if (item) tocar(Number(item.dataset.i));
});

/* ---------- Pesquisa ---------- */
$("busca").addEventListener("keydown", (e) => {
  const q = e.target.value.trim();
  if (e.key === "Enter" && q) {
    mostrar("musicas");
    carregar(`https://api.deezer.com/search?q=${encodeURIComponent(q)}`, `Resultados para "${q}"`);
  }
});

/* ---------- Player ---------- */
const audio = $("audio");

function tocar(i) {
  if (i < 0 || i >= faixas.length) return;
  atual = i;
  const m = faixas[i];
  audio.src = m.preview;
  audio.play();
  $("titulo").textContent = m.title;
  $("artista").textContent = m.artist.name;
  $("capa").src = m.album.cover_small;
  $("capa").hidden = false;
  document.querySelectorAll(".faixa").forEach((el, n) => el.classList.toggle("tocando", n === i));
}

$("btnPlay").addEventListener("click", () => {
  if (atual === -1) return tocar(0);
  audio.paused ? audio.play() : audio.pause();
});
$("btnProxima").addEventListener("click", () => tocar(atual + 1));
$("btnAnterior").addEventListener("click", () => tocar(atual - 1));

audio.addEventListener("play", () => ($("btnPlay").textContent = "⏸"));
audio.addEventListener("pause", () => ($("btnPlay").textContent = "▶"));
audio.addEventListener("ended", () => tocar(atual + 1));
audio.addEventListener("timeupdate", () => ($("progresso").value = audio.currentTime));
$("progresso").addEventListener("input", (e) => (audio.currentTime = e.target.value));

carregar("https://api.deezer.com/chart/0/tracks", "Em alta agora");