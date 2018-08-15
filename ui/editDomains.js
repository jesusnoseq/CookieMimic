
function checkStoredData(){
    if(saveData){
        storeGet.then(results => {
            if (!results.domains) {
                results.domains=[];
            }
            generateForm(results.domains);
        });
    }else{
        generateForm([]);
    }
}

function generateForm(domains){
    while (domainsListContainer.firstChild) {
        domainsListContainer.removeChild(domainsListContainer.firstChild);
    }
    domains.forEach(d => {
        domainsListContainer.appendChild(generateField(d));
    });
}

function generateField(domain){
    let node = document.createElement("div");
    node.classList.add("panel-list-item");
    let textConainer=document.createElement("div");
    textConainer.classList.add("text");
    let textnode = document.createTextNode(domain);
    textConainer.appendChild(textnode);
    node.appendChild(textConainer);
    let button=document.createElement("button");
    button.classList.add("deleteButton");
    button.setAttribute('type', 'button');
    let x = document.createTextNode("");
    button.appendChild(x);
    node.appendChild(button);
    return node;
}


function addForm(e){
    e.preventDefault();
    let originInput=document.querySelector("#originDomain");
    let targetInput=document.querySelector("#targetDomain");
    if(originInput.value!=="" && targetInput.value!=""){
        domainsListContainer.prepend(generateField(originInput.value +";"+targetInput.value));

        originInput.value="";
        targetInput.value="";
        save(e);
    }
}


function deleteForm(e){
    e.preventDefault();
    if (!e.target.classList.contains("deleteButton")){
        return;
    }
    e.target.parentNode.remove()

    save(e);
}


function save(){
    let nodes=parentNode=document.querySelectorAll("#domainsList .text");
    let domains=[];
    nodes.forEach(n => {
        domains.push(n.textContent);
    });
    if(saveData){browser.storage.local.set({"domains":domains});}
    notifyChanges();
}

function notifyChanges(){
    var sending = browser.runtime.sendMessage({"domainChanged":true});
}

function init(){
    console.log("ext init");
    container=document.querySelector("#extContent");
    domainsListContainer=document.querySelector("#domainsList");

    document.querySelector("#domainsList").addEventListener("click", deleteForm);
    document.querySelector("#editDomainsForm").addEventListener("submit", addForm);
    
    if(saveData){storeGet=browser.storage.local.get()};
    checkStoredData();
}

// Load extension
document.addEventListener("DOMContentLoaded", init);
var saveData=true;
var container;
var domainsListContainer;
var storeGet;
