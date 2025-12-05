const URL = "http://localhost:8080";

const loginUrl = `${URL}/auth/login`;



function initializePage(){
    const topicoParam = getTopicoFromUrl();
    const inputTopico = document.querySelector("#pesquisa-topico");
    
    if (!inputTopico) {
        return;
    }
    

    if(topicoParam){
        getSolucaoByTopico(topicoParam.toUpperCase());

        if(inputTopico){
            inputTopico.value = topicoParam;
        }
    }else{
        getAllSolucoes();
    }
}



//? LÓGICA DA PARTE PÚBLICA (FAQ DE SOLUÇÕES)

function getTopicoFromUrl(){
    const params = new URLSearchParams(window.location.search);

    return params.get("topico");
}


// GET SOLUCOES
async function getAllSolucoes() {

    const response = await fetch(`${URL}/public/solucoes`);

    const listaSolucoes = document.querySelector("#lista-solucoes");

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
    const response = await fetch(`${URL}/public/solucoes/busca?topico=${topico}`);
    
    const listaSolucoes = document.querySelector("#lista-solucoes");

    while (listaSolucoes.firstChild){
        listaSolucoes.removeChild(listaSolucoes.firstChild)
    }

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
    history.pushState({path: newUrl}, '', newUrl);
}


//! LÓGICA DE LOGIN E PARTE PRIVADA



function redirecionarPorRole(role){
    if(role === "ROLE_ANALISTA"){
        window.location.href = "/analista.html";
    }else if(role === "ROLE_GERENTE"){
        window.location.href = "/gerente.html";
    }else{
        console.log(role);
        alert("não foi possível localizar usuário. Redirecionando para Home.");
        window.location.href = "/index.html";
    }
}

function getRoleFromToken(token){
    if(!token) return null;

    const base64Url = token.split('.')[1];

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);

    return payload.role;
    
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

        const token = data.token;
        const role = getRoleFromToken(token);

        if(!role){
            alert("Não foi possível identificar o papel do usuário.");
        }



        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        console.log(role);

        redirecionarPorRole(role);
    } else{
        alert("Falha no login. Verifique seus dados.");
    }
}

//! LÓGICA BOTÃO DE LOGIN

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

    const response = await fetch(`${URL}/analista/tickets`, {
        method: "GET",
        headers: headers
    });

    if(response.status === 403 || response.status === 401){
        alert("Sua sessão expirou ou acesso negado.");
        window.location.href = "/login.html";
        return;
    }

    const data  = await response.json();

    data.map((ticket) => {
        const li = document.createElement("li");
        const descricao = document.createElement("p");
        const statusTicket = document.createElement("span");


        descricao.textContent = ticket.descricao;
        statusTicket.textContent = ticket.statusTicket;

        li.appendChild(descricao);
        li.appendChild(statusTicket);

        listaTicketsAnalista.appendChild(li);
    })


}



//? FUNÇÃO DO GERENTE


async function dashboardGerente(){

    
    const headers = getAuthHeader();
    if(!headers) return;

    const listaTicketsGerente = document.querySelector("#lista-tickets-gerente");
    const listaAnalistasGerente = document.querySelector("#lista-analistas-gerente");

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
            status.textContent = ticket.statusTicket;

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

function checarAcessoPagina(){
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    const path = window.location.pathname;

    const paginaAnalista = path.includes("analista.html");
    const paginaGerente = path.includes("gerente.html");
    const paginasRestritas = paginaAnalista || paginaGerente;

    if (!token && paginasRestritas) {
        alert("Acesso negado. Por favor, faça login.");
        window.location.href = '/login.html';
        return false; 
    }
    

    if (token) {

        if (paginaGerente && role !== 'ROLE_GERENTE') {
            alert("Acesso negado. Você será redirecionado para sua área.");
            console.log(role);
            window.location.href = '/analista.html';
            return false;
        }
        else if (paginaAnalista && role !== 'ROLE_ANALISTA') {
            alert("Acesso negado. Você será redirecionado para sua área.");
            console.log(role);
            window.location.href = '/gerente.html';
            return false;
        }
    }

    return true;
    
}

document.addEventListener("DOMContentLoaded", () => {
    const btnPesquisar = document.querySelector("#btn-pesquisar");
    const pesquisaTopico = document.querySelector("#pesquisa-topico");
    
    const autorizcao = checarAcessoPagina();

    if(!autorizcao){
        return;
    }

    if(btnPesquisar && pesquisaTopico){    
        btnPesquisar.addEventListener("click", (e) => {
            e.preventDefault();

            const valorInput = pesquisaTopico.value.trim();
            const topico = valorInput ? valorInput.toUpperCase() : null;
            
            if(topico){
                getSolucaoByTopico(topico);
            }else{
                history.pushState({path: window.location.pathname}, '', window.location.pathname);
                getSolucaoByTopico(null);
            }
        });
    }
    
    //! LÓGICA BOTÃO DE LOGIN
    const btnLogin = document.querySelector("#botao-login");
    const inputMatricula = document.querySelector("#input-matricula");
    const inputSenha = document.querySelector("#input-senha");

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

    initializePage();

    // RESTRIÇÃO DAS PÁGINAS

    const path = window.location.pathname;

    if(path.includes("/analista.html")){
        buscarTicketsAnalista();
    }else if(path.includes("/gerente.html")){
        dashboardGerente();
    }

    
    
});