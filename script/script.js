const URL = "https://localhost:3000/login";

async function chamarAPI() {
    const resp = await fetch(URL);
    console.log(resp)
}

chamarAPI();