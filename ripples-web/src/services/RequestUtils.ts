type optionsType = {
    url: string,
    method?: string,
    body?: string
}

export async function request(options: optionsType) {
    const headers = new Headers({
        'Content-Type': 'application/json',
    })
    
    if(localStorage.getItem("ACCESS_TOKEN")) {
        headers.append('Authorization', 'Bearer ' + localStorage.getItem("ACCESS_TOKEN"))
    }

    const defaults = {headers: headers};
    options = Object.assign({}, defaults, options);

    const response = await fetch(options.url, options);
    const json = await response.json();
    if (!response.ok) {
        return Promise.reject(json);
    }
    return json;
};