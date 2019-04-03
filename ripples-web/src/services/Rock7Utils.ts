const apiURL = process.env.REACT_APP_API_BASE_URL

export async function fetchTextMessages() {
    const response = await fetch(`${apiURL}/api/v1/iridium/plaintext`);
    const data = await response.json();
    return data;
  }