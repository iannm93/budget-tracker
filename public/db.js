
// TODO: open  indexedDB
const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;
const request = indexedDB.open("budget", 1);

// TODO: create an object store in the open db
request.onupgradeneeded = function (event) {
  db = event.target.result;
  // create object store called "pending" and set autoIncrement to true
  db.createObjectStore("pending", {
    keyPath: "id",
    autoIncrement: true
  });
};
// TODO: log any indexedDB errors
request.onsuccess = function ({ target }) {
  db = target.result;
  if (navigator.onLine) {
    inspectDb();
  }
};

request.onerror = event => {
  console.log(event.error);
  // function that logs an error if it occurs
};



function inspectDb(info) {
  // open transaction
  const transaction = db.transaction(["pending"], "readwrite");

  const storeBudget = transaction.objectStore("pending");
  //retrieve all info from store and record it as a variable
  const allBudget = storeBudget.getAll(info);
  allBudget.onsuccess = function () {
    if (allBudget.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(allBudget.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then((response) => response.json())
        .then((response) => {

          const transaction = db.transaction(["pending"], "readwrite");

          const storeBudget = transaction.objectStore("pending");
          // clear everything
          storeBudget.clear(response);
        });
    }
  };
}
// TODO: add code so that any transactions stored in the db
// are sent to the backend if/when the user goes online
// Hint: learn about "navigator.onLine" and the "online" window event.

// TODO: add code toinfo so that it accepts a record object for a
// transaction and saves it in the db. This function is called in index.js
// when the user creates a transaction while offline.
function saveRecord(info) {
  const trans = db.transaction(["pending"], "readwrite");
  
  const storeBudget = trans.objectStore("pending");
  
  storeBudget.add(info);
  // add your code here
}
// check to see if app is online
window.addEventListener("online", inspectDb);
