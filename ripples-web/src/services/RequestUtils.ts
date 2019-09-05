interface OptionsType {
  url: string
  method?: string
  body?: string
}

export async function request(options: OptionsType) {
  const headers = new Headers({
    'Content-Type': 'application/json',
  })

  if (localStorage.getItem('ACCESS_TOKEN')) {
    headers.append('Authorization', 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'))
  }

  const defaults = { headers }
  options = Object.assign({}, defaults, options)

  const response = await fetch(options.url, options)
  try {
    const json = await response.json()
    if (!response.ok) {
      return Promise.reject(json)
    }
    return json
  } catch(error) {
    return error
  }
}
