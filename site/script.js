// ------------------------ DEBUG ----------------------- //
//uncomment to turn off console logs
// console.log = (x)=>{}

// ----------------------- OBJECTS ---------------------- //

class Note {
  //class for notes
  constructor(title, text, creationTime=new Date()) {
    //takes title and note content
    this.title = title;
    this.note = text;
    this.creationTime = creationTime; //sets the creation time at note creation
  }
}

// https://stackoverflow.com/a/24676492
// function auto_grow(element) {
//   element.style.height = "5em";
//   element.style.height = (element.scrollHeight) + "px";
// }

// ------------------ GLOBAL VARIABLES ------------------ //

const notebook = []; //stores the notes
let db; //for indexedDB
const dbName = "notesDB"; //indexedDB database name
const objectStoreNameNotes = "notebookObjectStore"; //indexedDB datastore name to store notes

// ------------------- HTML SELECTORS ------------------- //
const mainDiv = document.getElementsByTagName("main")[0]; //get main element
const newNoteDialog = document.querySelector("#newNoteDialog"); //get dialog element for new notes
const newNoteButton = document.getElementById("newNoteButton"); // new note button on main page
const newNoteTitle = document.querySelector("#newNoteDialog input"); //new note title in new note dialog
const newNoteContents = document.querySelector("#newNoteDialog textarea"); //new note contents in new note dialog
const newNoteDialogSaveButton = document.querySelector("#noteEditSaveButton"); //save button in new note dialog
const sortButton = document.querySelector("#sortForm input"); //sort button on main page
const sortDirection = document.querySelector("#sortBySelect"); //sort type dropdown
const noteEditCancelButton = document.querySelector("#noteEditCancelButton"); //cancel button in note edit dialog

// ---------------------- FUNCTIONS ---------------------- //

function editNote(e) {
  e.preventDefault();
  // console.log(e.target)
  // console.log(e.target.dataset.id)
  const key = new Date(); //create a date object to use as my key to access indexedDB
  key.setTime(e.target.dataset.id); //set my key to the same time as the note
  console.log(key);
  const request = db
    .transaction(objectStoreNameNotes, "readonly")
    .objectStore(objectStoreNameNotes)
    .get(key); //get note from store


  newNoteDialog.dataset.NoteId = e.target.dataset.id //set the id so we can replace the notes
  
  request.onerror = (e) => {
    alert(e);
  };

  request.onsuccess = (e) => {
    //set note edit dialog to the content of the note and show it.
    const oldNote = e.target.result;
    console.log(e.target.result);
    newNoteTitle.value = oldNote.title;
    newNoteContents.value = oldNote.note;
    newNoteDialog.dataset.editNote = true; //change the behavior of the new note dialog
    newNoteDialog.showModal();
  };
}

function deleteNote(e){
  e.preventDefault();
  const key = new Date()
  key.setTime(e.target.dataset.id) //set key to use to access indexedDB
  console.log(`delete key = ${key}`)


  const request = db
    .transaction(objectStoreNameNotes, "readwrite")
    .objectStore(objectStoreNameNotes)
    .delete(key);
    
    request.onsuccess = () =>{
      notebook.length = 0; //empty array https://stackoverflow.com/a/1232046
      loadFromDB();
    }

    request.onerror = (e) =>{
      alert(e)
    }

}

function draw() {
  mainDiv.innerHTML = ""; //clear main div for redraw

  for (let note of notebook.values()) {
    // console.log(
    //   "title: " +
    //     note.title +
    //     "\ncontents: " +
    //     note.note +
    //     "\ncreated on: " +
    //     note.creationTime
    // );

    // console.log(JSON.stringify(note));

    // ------------------- CREATE NOTE IN HTML ------------------ //

    // div to hold the note
    const div = document.createElement("div");
    div.className = "note";
    //note title
    const h1 = document.createElement("h1");
    h1.insertAdjacentText("afterbegin", note.title);
    //note content
    const content = document.createElement("p");
    content.insertAdjacentText("afterbegin", note.note);
    //div to hold creation date
    const creationDateDiv = document.createElement("div");
    creationDateDiv.className = "creationDate";
    //label for creation date
    const labelForCreationDate = document.createElement("p");
    labelForCreationDate.insertAdjacentText("afterbegin", "Creation Date: ");
    //creation date
    const creationDate = document.createElement("p");
    creationDate.insertAdjacentText(
      "afterbegin",
      note.creationTime.toLocaleString()
    );

    //div to hold edit and delete buttons
    const editAndDeleteButtonClassName = "noteButtons";
    const editAndDeleteDiv = document.createElement("div");
    editAndDeleteDiv.classList.add("editAndDeleteDiv");
    //edit note button
    const editNoteButton = document.createElement("button");
    editNoteButton.classList.add("editNoteButton");
    editNoteButton.classList.add(editAndDeleteButtonClassName);
    editNoteButton.insertAdjacentText("afterbegin", "Edit");
    editNoteButton.dataset.id = note.creationTime.getTime(); //add the creation time as an id so we can find the note
    editNoteButton.addEventListener("click", editNote);
    editAndDeleteDiv.append(editNoteButton);
    //delete note button
    const deleteNoteButton = document.createElement("button");
    deleteNoteButton.classList.add("deleteNoteButton");
    deleteNoteButton.insertAdjacentText("afterbegin", "DELETE");
    deleteNoteButton.classList.add(editAndDeleteButtonClassName);
    deleteNoteButton.dataset.id = note.creationTime.getTime(); //add creation time to find the note later
    deleteNoteButton.addEventListener("click",deleteNote)
    editAndDeleteDiv.append(deleteNoteButton);

    //append everything in order
    div.append(h1);
    div.append(content);
    creationDateDiv.append(labelForCreationDate);
    creationDateDiv.append(creationDate);
    div.append(creationDateDiv);
    div.append(editAndDeleteDiv);
    mainDiv.append(div);
  }
}

function connectToDB() {
  //connect to indexedDB for saving and loading notes
  const openRequest = window.indexedDB.open(dbName, 1);

  openRequest.addEventListener("error", () => {
    console.log("IndexedDB failed to open");
  });

  openRequest.addEventListener("success", () => {
    //connects successfully with out issue

    db = openRequest.result; //so we can use the IndexedDB later
    loadFromDB();
    draw();
    console.log("IndexedDB opened successfully");
  });

  openRequest.addEventListener("upgradeneeded", (e) => {
    //connects but db is either not created or needs to be updated
    db = e.target.result;
    const objectStore = db.createObjectStore(objectStoreNameNotes, {
      keypath: "creationTime",
    }); //create an object store with the object store name

    objectStore.createIndex("note", "note"); //create an index in the object store called "note" to be accessed the param "IDBCursorObject.value"

    console.log("IndexedDB setup complete");
    draw(); //draw webpage
  });
}

function loadFromDB() {
  //load data from IndexedDB
  const objectStore = db
    .transaction(objectStoreNameNotes)
    .objectStore(objectStoreNameNotes);
  objectStore.openCursor().addEventListener("success", (e) => {
    const cursor = e.target.result;
    console.log("loading from IndexedDB");

    if (cursor) {
      notebook.push(cursor.value);
      console.log(cursor.value.creationTime);
      cursor.continue();
    }
    draw();
    console.log("Draw from loadDB");
  });
}

function saveToDB(newNote) {
  const transaction = db.transaction([objectStoreNameNotes], "readwrite"); //set up a transaction to handle the status events
  const objectStore = transaction.objectStore(objectStoreNameNotes); //specify the object store to access
  const addRequest = objectStore.add(newNote, newNote.creationTime); //use the transaction to generate a request to add the new note to the IndexedDB

  transaction.addEventListener("complete", () => {
    console.log(`Note: ${newNote.title} saved to IndexedDB`);
  });

  transaction.addEventListener("error", () => {
    alert(
      `Note: ${newNote.title} not saved.\nYou will loose the note on browser refresh`
    );
  });
}

// -------------------GLOBAL EVENT LISTENERS ------------------ //

newNoteButton.addEventListener("click", () => {
  //open the new note modal
  newNoteTitle.value = ""; //clear title on modal open
  newNoteContents.value = ""; //clear text area on modal open
  newNoteDialog.showModal();
});

newNoteDialogSaveButton.addEventListener("click", (e) => {
  //button to save the note in the new note modal
  // e.preventDefault();//stop the window closing if the note doesnt save to IndexedDB
  if (newNoteDialog.dataset.editNote) {
    const creationDate  = new Date();
    creationDate.setTime(newNoteDialog.dataset.NoteId);
    const tempNote = new Note(newNoteTitle.value,newNoteContents.value,creationDate)
    tempNote.modTime = new Date();
    const updateRequest = db.transaction(objectStoreNameNotes,"readwrite").objectStore(objectStoreNameNotes).put(tempNote,creationDate)
    notebook.length = 0; // clears the array https://stackoverflow.com/a/1232046 
    loadFromDB(); 
    newNoteDialog.dataset.editNote=false;
    newNoteDialog.dataset.NoteId= 0;

  } else {
    const tempNote = new Note(newNoteTitle.value, newNoteContents.value);
    notebook.push(tempNote); //save note into working array
    saveToDB(tempNote); //save temp note into IndexedDB
    draw();
  }
});

// sortButton.addEventListener("click",()=>{ //sorting functions
sortDirection.addEventListener("click", () => {
  switch (sortDirection.value) {
    case "a-z":
      notebook.sort((a, b) => {
        //sort by Title A-Z
        return a.title.localeCompare(b.title);
      });
      break;
    case "z-a":
      notebook.sort((a, b) => {
        //sort by Title Z-A
        return b.title.localeCompare(a.title);
      });
      break;
    case "newest":
      notebook.sort((a, b) => {
        //sort by newest note first
        console.log(b.creationTime - a.creationTime);
        return b.creationTime - a.creationTime; //"b" goes first because the Date object stores the time as Unix time. thus an object created later will have a bigger number. since we want the biggest "time value" to be first a bigger number minus a smaller number will create a positive value meaning when it is returned "a" will be placed ahead of "b" .
      });
      break;
    case "oldest":
      notebook.sort((a, b) => {
        return a.creationTime - b.creationTime; //opposite of above
      });
      break;
  }
  draw();
});

noteEditCancelButton.addEventListener("click", (e) => {
  e.preventDefault(); // stop the form from being submitted
  newNoteDialog.close();
});

// ------------------ SCRIPT ENTRYPOINT ----------------- //

//generate some test data
// notebook.push(new Note("title", "this is some text"));
// notebook.push(new Note("title again", "this is text is bomb"));
// notebook.push(new Note("3RD note", "this is the text for the 3rd note"));

//set fonts
document.querySelector("body").className = "noto-serif-georgian-body";
connectToDB();
