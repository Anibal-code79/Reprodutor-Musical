const btnMusicas = document.getElementById("btnMusicas");
const btnArtistas = document.getElementById("btnArtistas");
const btnAlbuns = document.getElementById("btnAlbuns");

const musicas = document.getElementById("musicas");
const artistas = document.getElementById("artistas");
const albuns = document.getElementById("albuns");

function esconderTudo() {
  musicas.style.display = "none";
  artistas.style.display = "none";
  albuns.style.display = "none";
}

btnArtistas.addEventListener("click", () => {
  esconderTudo();
  artistas.style.display = "block";
   ativarBotao(btnArtistas);
});

btnAlbuns.addEventListener("click", () => {
    esconderTudo();
    albuns.style.display="block";
     ativarBotao(btnAlbuns);
});

btnMusicas.addEventListener("click", () => {
    esconderTudo();
    musicas.style.display="block";
     ativarBotao(btnMusicas);
});

function ativarBotao(botao) {
  btnMusicas.classList.remove("ativo");
  btnArtistas.classList.remove("ativo");
  btnAlbuns.classList.remove("ativo");

  botao.classList.add("ativo");
}

const input = document.querySelector("input");
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    buscarMusica(input.value);
  }
});

function buscarMusica(nome) {
  fetch(`https://cors-anywhere.herokuapp.com/https://api.deezer.com/search?q=${nome}`)
    .then(resposta => resposta.json())
    .then(dados => {
      console.log(dados);

      lista.innerHTML = ""; // limpa

      dados.data.forEach(musica => {
        const item = document.createElement("div");

        item.innerHTML = `
          <img src="${musica.album.cover}" width="50">
          <p>${musica.title}</p>
          <small>${musica.artist.name}</small>
          <audio controls src="${musica.preview}"></audio>
        `;

        lista.appendChild(item);
      });
    })
    .catch(erro => {
      console.log("Erro:", erro);
    });
}