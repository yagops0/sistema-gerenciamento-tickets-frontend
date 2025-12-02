const URL = "http://localhost:8080";

const listaSolucoes = document.querySelector("#lista-solucoes");



//? LÓGICA DA PARTE PÚBLICA (FAQ DE SOLUÇÕES)

function getTopicoFromUrl(){
    const params = new URLSearchParams(window.location.search);

    return params.get("topico");
}


// GET SOLUCOES
async function getAllSolucoes() {

    const response = await fetch(`${URL}/public/solucoes`);

    console.log(response);

    const data = await response.json();

    console.log(data);

    data.map((solucao) =>  {
        
        const li = document.createElement("li")
        const titulo = document.createElement("h3");
        const descricao = document.createElement("p");
        const topico = document.createElement("span");

        titulo.innerText = solucao.titulo;
        descricao.innerText = solucao.descricao;
        topico.innerText = solucao.topico;

        li.appendChild(titulo);
        li.appendChild(descricao);
        li.appendChild(topico);

        listaSolucoes.appendChild(li);
    })

}

// GET SOLUCOES BY TOPICO      

async function getSolucaoByTopico(topico) {

    while (listaSolucoes.firstChild){
        listaSolucoes.removeChild(listaSolucoes.firstChild)
    }

    const response = await fetch(`${URL}/public/solucoes/busca?topico=${topico}`);

    const data = await response.json();

    console.log(data);


    data.map((solucao) =>  {
        
        const li = document.createElement("li")
        const titulo = document.createElement("h3");
        const descricao = document.createElement("p");
        const topico = document.createElement("span");

        titulo.innerText = solucao.titulo;
        descricao.innerText = solucao.descricao;
        topico.innerText = solucao.topico;

        li.appendChild(titulo);
        li.appendChild(descricao);
        li.appendChild(topico);

        listaSolucoes.appendChild(li);
    })

    const newQuery = topico ? `?topico=${topico}` : '';
    const newUrl = `${window.location.pathname}${newQuery}`;
    history.pushState({path: newUrl}, '', newUrl);s
}

function initializePage(){
    const topicoParam = getTopicoFromUrl();
    const inputTopico = document.querySelector("#pesquisa-topico");

    if(topicoParam){

        getSolucaoByTopico(topicoParam.toUpperCase());

        if(inputTopico){
            inputTopico.value = topicoParam;
        }
    }else{

        getSolucaoByTopico(null);
        getAllSolucoes();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btnPesquisar = document.querySelector("#btn-pesquisar");
    const pesquisaTopico = document.querySelector("#pesquisa-topico");

    while (listaSolucoes.firstChild) {
        listaSolucoes.removeChild(listaSolucoes.firstChild);
    }

    if(btnPesquisar){
        btnPesquisar.addEventListener("click", (e) => {
            e.preventDefault();

            const valorInput = pesquisaTopico.value.trim();
            const topico = valorInput ? valorInput.toUpperCase() : null;
            
            if(topico){

                getSolucaoByTopico(topico);
            }else{
                history.pushState({path: window.location.pathname}, '',window.location.pathname);
                getSolucaoByTopico(null);
            }

        });
    }
    
    
    initializePage();
});

//! LÓGICA DE LOGIN E PARTE PRIVADA

