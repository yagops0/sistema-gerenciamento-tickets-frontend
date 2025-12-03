const URL = "http://localhost:8080";

const listaSolucoes = document.querySelector("#lista-solucoes");


function initializePage(){
    const topicoParam = getTopicoFromUrl();
    const inputTopico = document.querySelector("#pesquisa-topico");

    if(topicoParam){

        getSolucaoByTopico(topicoParam.toUpperCase());

        if(inputTopico){
            inputTopico.value = topicoParam;
        }
    }else{
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
        const titulo = document.createElement("h4");
        const descricao = document.createElement("p");
        const topico = document.createElement("span");

        titulo.textContent = solucao.titulo;
        descricao.textContent = solucao.descricao;
        topico.textContent = solucao.topico;

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
        const titulo = document.createElement("h4");
        const descricao = document.createElement("p");
        const topico = document.createElement("span");

        titulo.textContent = solucao.titulo;
        descricao.textContent = solucao.descricao;
        topico.textContent = solucao.topico;

        li.appendChild(titulo);
        li.appendChild(descricao);
        li.appendChild(topico);

        listaSolucoes.appendChild(li);
    })

    const newQuery = topico ? `?topico=${topico}` : '';
    const newUrl = `${window.location.pathname}${newQuery}`;
    history.pushState({path: newUrl}, '', newUrl);s
}


//! LÓGICA DE LOGIN E PARTE PRIVADA

const loginUrl = `${URL}/auth/login`;

function redirecionarPorRole(role){
    if(role === "ROLE_ANALISTA"){
        window.location.href = "/analista.html";
    }else if(role === "ROLE_GERENTE"){
        window.location.href = "/gerente.html";
    }else{
        alert("não foi possível localizar usuário. Redirecionando para Home.");
        window.location.href = "/index.html";
    }
}

async function login(matricula, senha){
    const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({matricula, senha})
    })
    
    if (response.ok){
        const data = await response.json();

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        redirecionarPorRole(data.role);
    } else{
        alert("Falha no login. Verifique seus dados.");
    }
}

//! LÓGICA BOTÃO DE LOGIN

const btnLogin = document.querySelector("#botao-login");
const inputMatricula = document.querySelector("#input-matricula");
const inputSenha = document.querySelector("#input-senha");

document.addEventListener("DOMContentLoaded", () => {

    if(btnLogin && inputMatricula && inputSenha){
        btnLogin.addEventListener("click", (e) => {
            e.preventDefault();

            const matricula = inputMatricula.value.trim();
            const senha = inputSenha.value;

            if(matricula && senha){
                login(matricula, senha);
            }else{
                alert("Por favor, preencha todos os campos de login.");
            }
        });
    }
});

function getAuthHeader(){
    const token = localStorage.getItem("token");

    if(!token){
        alert("Usuário não autenticado. Redirecionando para a página de login.");
        window.location.href = "/login.html";
        return null;
    }
    return {
        'Authorization' : `Bearer ${token}`,
        'Content-Type' : 'application/json'
    };
}



//? FUNÇÃO DO ANALISTA

const listaTicketsAnalista = document.querySelector("#lista-tickets-analista");

async function buscarTicketsAnalista() {
    const headers = getAuthHeader();
    if(!headers) return;

    const repsonse = await fetch(`${URL}/analista/tickets`, {
        method: "GET",
        headers: headers
    });

    if(response.status === 403 || repsonse.status === 401){
        alert("Sua sessão expirou ou acesso negado.");
        window.location.href = "/login.html";
        return;
    }

    const data  = await response.json();

    data.map((ticket) => {
        const li = document.createElement("li");
        const descricao = document.createElement("p");
        const status = document.createElement("span");


        descricao.textContent = ticket.descricao;
        status.textContent = ticket.status;

        li.appendChild(descricao);
        li.appendChild(status);

        listaTicketsAnalista.appendChild(li);
    })


}



//? FUNÇÃO DO GERENTE

const listaTicketsGerente = document.querySelector("#lista-tickets-gerente");
const listaAnalistasGerente = document.querySelector("#lista-analistas-gerente");

async function dashboardGerente(){
    const headers = getAuthHeader();
    if(!headers) return;

    const promiseTickets = fetch(`${URL}/gerente/dashboard/tickets`, {headers});
    const promiseAnalistas = fetch(`${URL}/gerente/dashboard/analistas`, {headers});

    const [responseTickets, responseAnalistas] = await Promise.all([promiseTickets, promiseAnalistas]);

    if(responseTickets.ok){
        const tickets = await responseTickets.json();

        tickets.map((ticket) => {
            const li = document.createElement("li");
            const users = document.createElement("h4");
            const descricao = document.createElement("p")
            const status = document.createElement("span");

            users.textContent = ticket.users;
            descricao.textContent = ticket.descricao;
            status.textContent = ticket.status;

            li.appendChild(users);
            li.appendChild(descricao);
            li.appendChild(status);

            listaTicketsGerente.appendChild(li);
        })
    }

    if(responseAnalistas.ok){
        const analistas = await responseAnalistas.json();

        analistas.map((analista) => {
            const li = document.createElement("li");
            const matricula = document.createElement("p");
            const role = document.createElement("span");

            matricula.textContent = analista.matricula;
            role.textContent = analista.role;

            li.appendChild(matricula);
            li.appendChild(role);

            listaAnalistasGerente.appendChild(li);
        })
    }
    

}