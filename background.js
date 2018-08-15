
/************ Options menu */
function handleClick() {
  browser.runtime.openOptionsPage();
}

browser.browserAction.onClicked.addListener(handleClick);


/************ Load and update domain list */
var domains;

function getDomains(){
  return domains;
}


function restoreOptions() {
    var storeGet =browser.storage.local.get();
    storeGet.then((res) => {
      processDomainList(res.domains)
      console.log("domains procesed", domains);
    });
}

function processDomainList(dList){
  var newDomains=[]
  for(d of dList) {
    splittedDomain=d.split(";");
    let origin=splittedDomain[0]
    let target=splittedDomain[1]
    newDomains[origin]=target
  }
  domains=newDomains;
}

restoreOptions();

function handleUpdateDomainsMessage(request, sender, sendResponse) {
  restoreOptions();
  console.log("Updating domain list");
  sendResponse({response: "ok"});
}

browser.runtime.onMessage.addListener(handleUpdateDomainsMessage);


/************ Cookie copy remove */
const ExplicitChangeEvent="explicit";
const HTTPPrefix="http://";

browser.cookies.onChanged.addListener(function(changeInfo) {
  
  if(ExplicitChangeEvent !== changeInfo.cause || !isInDomainList(changeInfo.cookie.domain)){
    return
  }

  newDomain=getDomains()[changeInfo.cookie.domain]
  console.log('Cookie changed: ',changeInfo);
  if(changeInfo.cookie.removed){
    removeCookie(changeInfo.cookie,newDomain)
  }else{
    setCookie(changeInfo.cookie,newDomain);
  }
});

function isInDomainList(domain){
  console.log(domain,"is In Domain List", getDomains()[domain]!==undefined);
  return  getDomains()[domain]!==undefined
}

function setCookie(cookie,newDomain){
  newCookie=Object.assign({}, cookie);
  newCookie.domain=newDomain;
  newCookie.url=HTTPPrefix+newDomain;
  delete newCookie.hostOnly;
  delete newCookie.session;

  var setting =browser.cookies.set(newCookie);
  setting.then(notify(cookie,newDomain), fallback);
}

function removeCookie(cookie,newDomain){
  var removing =browser.cookies.remove({
    name: cookie.name,
    domain:newDomain,
    url:HTTPPrefix+newDomain
  });
  removing.then(notify(cookie,newDomain), fallback);
}

function fallback(err){
  console.log("Error set or remove cookie",err);
}

/************ User notifications */

function notify(cookie,newDomain){ 
  console.log("Cookie",cookie.name,"cloned to",newDomain);
  n=browser.notifications.create({
    "type": "basic",
    "iconUrl": browser.extension.getURL("icons/icon48.png"),
    "title": getNotificationTittle(cookie,newDomain),
    "message":  getNotificationContent(cookie)
  });
}

function getNotificationTittle(cookie,newDomain){
  var action="copied"
  if(cookie.removed){
    action="removed"
  }
  return "Cookie "+action+" from "+cookie.domain+" to "+newDomain;
}

function getNotificationContent(cookie){
  return cookie.name+": "+cookie.value;
}

