export const request = (url: string) => {
    const headers = new Headers({
        'Content-Type': 'application/json',
    })
    
    if(localStorage.getItem("ACCESS_TOKEN")) {
        headers.append('Authorization', 'Bearer ' + localStorage.getItem("ACCESS_TOKEN"))
    }

    const defaults = {headers: headers};

    return fetch(url, defaults)
    .then(response => 
        response.json().then(json => {
            if(!response.ok) {
                return Promise.reject(json);
            }
            return json;
        })
    );
};