#!/usr/bin/env node

// demo http://api.mega-bank.com/users/

const XMLHttpRequest = require('xhr2');
const readline = require("readline-sync");

let url = readline.question('Enter URL: ');
let type = readline.question('Enter type: ');


if (url && type) {
    url = url.replace(/\/$/, "");
    if (!url.startsWith('http' || 'https')) {
        url = 'http://' + url;
    }
    if (type === 'api') {
        discoverAPI(url);
    } else if (type === 'dirb') {
        discoverDirectories(url);
    }
}

function discoverAPI(url) {
    const verbs = ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'];
    const promises = [];
    verbs.forEach((verb) => {
        const promise = new Promise((resolve, reject) => {
            const http = new XMLHttpRequest();
            http.open(verb, url, true)
            http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            http.onreadystatechange = () => {
                if (http.readyState === 4) {
                    return resolve({ verb: verb, status: http.status });
                }
            }
            setTimeout(() => {
                return resolve({ verb: verb, status: -1 });
            }, 3000);
            http.send();
        });
        promises.push(promise);
    });
    Promise.all(promises).then(values => {
        console.log(values);
    });
}

function discoverDirectories(url) {
    const xhr2 = new XMLHttpRequest();
    const promises = [];
    if (url.endsWith('/')) {
        url = url.substring(0, url.length - 1);
    }
    xhr2.open('GET', 'https://raw.githubusercontent.com/v0re/dirb/master/wordlists/common.txt', true);
    xhr2.onreadystatechange = () => {
        if (xhr2.readyState === 4) {
            words = xhr2.responseText.split('\n');
            words.forEach((word) => {
                const promise = new Promise((resolve, reject) => {
                    const http = new XMLHttpRequest();
                    http.open('GET', url + '/' + word, true)
                    http.onreadystatechange = () => {
                        if (http.readyState === 4) {
                            return resolve({ word: word, status: http.status });
                        }
                    }
                    setTimeout(() => {
                        return resolve({ word: word, status: -1 });
                    }, 3000);
                    http.send();
                });
                promises.push(promise);
            });
            Promise.all(promises).then(values => {
                values.forEach((value) => {
                    if (value.status != -1) {
                        console.log(value);
                    }
                });
            });
        }
    }
    xhr2.send();

}





