//solution based on benfrain.com
import { mlCodes } from './mlCodes.js';
import { mlStrings } from './mlStrings.js';

// Global var :(
let mlrLangInUse;

setMlrAttribute();

let mlr = function ({
    dropID = "mbPOCControlsLangDrop",
    stringAttribute = "data-mlr-text",
    chosenLang = "English",
    mlStrings = mlStrings,
    countryCodes = false,
    countryCodeData = [],
} = {}) {
    const root = document.documentElement;

    let listOfLanguages = Object.keys(mlStrings[0]);
    mlrLangInUse = chosenLang;

    (function createMLDrop() {
        let mbPOCControlsLangDrop = document.getElementById(dropID);
        // Reset the menu
        mbPOCControlsLangDrop.innerHTML = "";
        // Now build the options
        listOfLanguages.forEach((lang, langidx) => {
            let HTMLoption = document.createElement("option");
            HTMLoption.value = lang;
            HTMLoption.textContent = countryCodeData.find(x => x.name === lang).code;
            mbPOCControlsLangDrop.appendChild(HTMLoption);
            if (lang === chosenLang) {
                mbPOCControlsLangDrop.value = lang;
            }
        });
        mbPOCControlsLangDrop.addEventListener("change", function (e) {
            mlrLangInUse = mbPOCControlsLangDrop[mbPOCControlsLangDrop.selectedIndex].value;
            resolveAllMLStrings();
            // Here we update the 2-digit lang attribute if required
            if (countryCodes === true) {
                if (!Array.isArray(countryCodeData) || !countryCodeData.length) {
                    console.warn("Cannot access strings for language codes");
                    return;
                }
                root.setAttribute("lang", updateCountryCodeOnHTML().code);
            }
        });
    })();

    function updateCountryCodeOnHTML() {
        return countryCodeData.find(this2Digit => this2Digit.name === mlrLangInUse);
    }

    function resolveAllMLStrings() {
        let stringsToBeResolved = document.querySelectorAll(`[${stringAttribute}]`);

        stringsToBeResolved.forEach(stringToBeResolved => {
            let originaltextContent = stringToBeResolved.textContent;
            originaltextContent = formatText(stringToBeResolved);
            let resolvedText = resolveMLString(originaltextContent, mlStrings);

            if(stringToBeResolved.children.length > 0) {
                stringToBeResolved.innerHTML = restoreElementChildren(stringToBeResolved, resolvedText);
            } else {
                stringToBeResolved.textContent = resolvedText;
            }
        });
    }
};

function resolveMLString(stringToBeResolved, mlStrings) {
    let matchingStringIndex = mlStrings.find(function (stringObj) {
        // Create an array of the objects values:
        let stringValues = Object.values(stringObj);
        // Now return if we can find that string anywhere in there
        return stringValues.includes(stringToBeResolved);
    });
    if (matchingStringIndex) {
        // If we don't have a match in our language strings, return the English version
        if (matchingStringIndex[mlrLangInUse] === undefined) {
            return matchingStringIndex["English"]
        }
        else {
            return matchingStringIndex[mlrLangInUse];
        }
    }
}

mlr({
    dropID: "mbPOCControlsLangDrop",
    stringAttribute: "data-mlr-text",
    chosenLang: "English",
    mlStrings: mlStrings,
    countryCodes: true,
    countryCodeData: mlCodes,
});

function restoreElementChildren(e, resolvedText) {
    const tags = e.innerHTML.match(/<(.+?)>/g)
    const content = e.innerHTML.match(/[^>]+(?=<\/\w+>)/g)

    if (e.hasAttribute("data-toggle")) {
        if(e.attributes["data-toggle"].value === "dropdown" && content === null){
            return `${resolvedText}${tags.join("")}`;
        }
    }

    //ugly workaround to restore the text inside <a><code></code></a> children
     if(tags[2] === "</code>" && tags[3] === "</a>"){
        return resolvedText.replace(content, `${tags[0]}${tags[1]}${content}${tags[2]}${tags[3]}`) 
     }
     
     if(tags[1] === "</code>" && tags[4] === "</code>" && tags[5] === "</a>"){
        resolvedText =resolvedText.replace(content[0], `${tags[0]}${content[0]}${tags[1]}`) 
        return resolvedText.replace(content[1], `${tags[2]}${tags[3]}${content[1]}${tags[4]}${tags[5]}`) 
     }  
     
     else {
        let i = 0
        content.map(x => {
            resolvedText = resolvedText.replace(x, `${tags[0 + i]}${x}${tags[1 + i]}`)
            i += 2
        })
        return resolvedText
    }
}

function formatText(text){
    let textContent = text.textContent
    let innerText = text.innerText
    //remove breaklines
    textContent = textContent.replace(/(\r\n|\n|\r)/gm,"");
    //remove multiple spaces
    textContent = textContent.replace(/ {1,}/g," ");
    //restore spaces at start and end of the string
    if(textContent[0] !== innerText[0]){
        textContent = textContent.substr(1)
    }
    if(textContent[textContent.length-1] !== innerText[innerText.length-1]){
        textContent = textContent.substr(0,textContent.length-1)
    }
    return textContent
}

function setMlrAttribute (){
    let codeSnippets = document.getElementsByClassName("hljs-comment")
    //to make sure hljs-comment was already created
    let interval = setInterval(function() {
        if (typeof codeSnippets == 'undefined') return;
        clearInterval(interval);

        const comments = [...codeSnippets]
        comments.map(comments=>{
            const attr = document.createAttribute("data-mlr-text")
            comments.setAttributeNode(attr)
        })
    }, 10);
}