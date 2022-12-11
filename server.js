const fs = require('fs');
const urlParser = require("url");
const axios = require("axios");
const cheerio = require("cheerio");

const fixURL = (link) => {
  if(link){
    if (link.includes("http")) {
      return link;
    } 
    else {
      return `https:${link}`;
    }
  };
  }
   
async function main(url,depth) {
  fs.createWriteStream('results.json');
  const allURLs = [url];
  var visitedURLs = [];
  var seenURLs = [];
  while(allURLs.length !== 0) {
    visitedURLs = [allURLs[allURLs.length-1]];

  while (visitedURLs.length <= depth) {
      var url = allURLs.pop();
      url = fixURL(url);
      visitedURLs.push(url); //visitedURLs is for depth purposes, seenURLs is used to make sure we aren't exploring the same URL twice
      seenURLs.push(url);
      const pageHTML = await axios.get(url);

      const $ = cheerio.load(pageHTML.data);
      const parsedURL = urlParser.parse(url);
      const host = parsedURL.host;
      const links = $("a").map((i,link) => link.attribs.href).get();
      
      const imageUrls = $("img").map((i, link) => link.attribs.src).get();

      links.forEach((link) => {
      if (!seenURLs.includes(link) && !allURLs.includes(link) && link.includes(host)) {
        allURLs.push(link);
      }

    });
    
    imageUrls.forEach((imageURL) => {  
      const result = {
        imageURL: fixURL(imageURL),
        sourceURL: url,
        depth: visitedURLs.length-1,
    };
    
    var jsonString = JSON.stringify(result);
    jsonString += '\n';
    fs.appendFile("results.json", jsonString, (err) => {
      if (err) {
        console.log(err);
      }
    });
    })
      }
  }
}

const cliArgs = process.argv;
const url = cliArgs[2];
const depth = cliArgs[3];
main(url,depth);

