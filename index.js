const fs = require('fs');
const validator = require('validator');
const axios = require('axios');
const apiKey = 'Your API key'; // https://hunter.io/ se faire un compte pour recup l'API key

const fileContents = fs.readFileSync('emails.txt', 'utf-8'); // Remplace "email.txt" par le nom de ton ficher avec les emails.
const emailArray = fileContents.split('\n');

const validEmails = [];
const invalidEmails = [];

function getRandomProxy() {
  const proxies = fs.readFileSync('proxy.txt', 'utf-8').trim().split('\n'); // Ici le noms du fichiers qui contiens les proxies.
  return proxies[Math.floor(Math.random() * proxies.length)];
}

function verifyEmail(email) {
  const proxy = getRandomProxy();
  const instance = axios.create({
    proxy: {
      host: proxy.split(':')[0],
      port: proxy.split(':')[1],
    },
  });
  
  let url = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${apiKey}`;
  axios.get(url)
    .then((response) => {
        const data = response.data;
        if (data.data.result == "deliverable") {
            console.log("[valid]" + email);
            validEmails.push(email);
            fs.appendFileSync('valid.txt', email + '\n');
        } else {
            console.log("[invalid]" + email);
            invalidEmails.push(email);
            fs.appendFileSync('invalid.txt', email + '\n');
        }
    })
    .catch((err) => console.log(`Error ${err}`));
}

emailArray.forEach(email => {
  if (validator.isEmail(email.trim())) {
    verifyEmail(email.trim());
  } else {
    invalidEmails.push(email.trim());
    fs.appendFileSync('invalid.txt', email.trim() + '\n');
  }
});