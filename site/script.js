"use strict"
// ------------------------ DEBUG ----------------------- //
//uncomment to turn off console logs comment to turn them back on
// console.log = (x)=>{}

// ----------------------- OBJECTS ---------------------- //

class Note {
  //class for notes
  constructor(title, text, creationTime = new Date()) {
    //takes title and note content
    this.title = title;
    this.note = text;
    this.creationTime = creationTime; //sets the creation time at note creation
  }
}

// ------------------ GLOBAL VARIABLES ------------------ //

const notebook = []; //stores the notes
let db; //for indexedDB
const dbName = "notesDB"; //indexedDB database name
const objectStoreNameNotes = "notebookObjectStore"; //indexedDB datastore name to store notes
let objectStoreForTransactions; //object store to use with IndexedDB transactions

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
  key.setTime(e.target.dataset.id); //set my key to the same time as the note this is used to get the correct note from IndexedDB
  console.log(key);
  const request = db
    .transaction(objectStoreNameNotes, "readonly")
    .objectStore(objectStoreNameNotes)
    .get(key); //get note from store
    newNoteDialog.dataset.NoteId = e.target.dataset.id; //set the id so we can load the correct note
    
    request.onerror = (e) => {
      alert(e);
    };
    
    request.onsuccess = (e) => {
    //set note edit dialog to the content of the note and show it.
    const oldNote = e.target.result; //save the note we want from IndexedDB
    console.log(e.target.result);
    newNoteTitle.value = oldNote.title; //set the title in the note edit modal
    newNoteContents.value = oldNote.note; // set the note content in the note edit modal
    newNoteDialog.dataset.editNote = true; //change the behavior of the new note dialog
    newNoteDialog.showModal(); //show the note edit modal
  };
}

function deleteNote(e) {
  e.preventDefault(); //stop events from propagating
  const key = new Date(); 
  key.setTime(e.target.dataset.id); //set up the key to delete the correct note in indexedDB
  console.log(`delete key = ${key}`);

  const request = db
    .transaction(objectStoreNameNotes, "readwrite")
    .objectStore(objectStoreNameNotes)
    .delete(key); //send the request to delete the note

  request.onsuccess = () => {
    notebook.length = 0; //empty array https://stackoverflow.com/a/1232046
    loadFromDB();
  };

  request.onerror = (e) => {
    alert(e);
  };
}

function draw() {
  mainDiv.innerHTML = ""; //clear main div for redraw

  for (let note of notebook.values()) {

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
    //div to hold creationDate and modification date
    const createAndModDiv = document.createElement("div");
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
    createAndModDiv.append(creationDateDiv);
    //modification time if exists
    if (note.modTime) {
      const modTimeDiv = document.createElement("div");
      const modTimeLabel = document.createElement("p");
      modTimeLabel.insertAdjacentText("afterbegin", "Modified:");
      const modTimeTime = document.createElement("p");
      modTimeTime.insertAdjacentText(
        "afterbegin",
        note.modTime.toLocaleString()
      );
      modTimeDiv.append(modTimeLabel);
      modTimeDiv.append(modTimeTime);
      createAndModDiv.append(modTimeDiv);
    }

    //div to hold edit and delete buttons
    const editAndDeleteButtonClassName = "noteButtons";
    const editAndDeleteButtonDiv = document.createElement("div");
    editAndDeleteButtonDiv.classList.add("editAndDeleteDiv");
    //edit note button
    const editNoteButton = document.createElement("button");
    editNoteButton.classList.add("editNoteButton");
    editNoteButton.classList.add(editAndDeleteButtonClassName);
    editNoteButton.insertAdjacentText("afterbegin", "Edit");
    editNoteButton.dataset.id = note.creationTime.getTime(); //add the creation time as an id so we can find the note
    editNoteButton.addEventListener("click", editNote);
    editAndDeleteButtonDiv.append(editNoteButton);
    //delete note button
    const deleteNoteButton = document.createElement("button");
    deleteNoteButton.classList.add("deleteNoteButton");
    deleteNoteButton.insertAdjacentText("afterbegin", "DELETE");
    deleteNoteButton.classList.add(editAndDeleteButtonClassName);
    deleteNoteButton.dataset.id = note.creationTime.getTime(); //add creation time to find the note later
    deleteNoteButton.addEventListener("click", deleteNote);
    editAndDeleteButtonDiv.append(deleteNoteButton);

    //append everything in order
    div.append(h1);
    div.append(content);
    creationDateDiv.append(labelForCreationDate);
    creationDateDiv.append(creationDate);
    div.append(createAndModDiv);
    div.append(editAndDeleteButtonDiv);
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
  objectStore.openCursor().addEventListener("success", (e) => { //grab cursor to iterate over IndexedDB
    const cursor = e.target.result; 
    console.log("loading from IndexedDB");

    if (cursor) { //iterate over IndexedDB and store notes in the array "notebook" so we can sort and display the notes
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
  const addRequest = objectStore.add(newNote, newNote.creationTime); //use the transaction to generate a request to add the new note to the IndexedDB. NB: we are using the note creation time object as an access key

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
  //TODO: stop the window closing if the note doesnt save
  // e.preventDefault();//stop the window closing if the note doesnt save to IndexedDB
  if (newNoteDialog.dataset.editNote) { //if we are editing the note the we want to replace the old note with the new one in the IndexedDB. The edit note var is set when the edit button is clicked on a note
    const creationDate = new Date(); //create a new date object to store the old creation date. it is easier to recreate the note then pass the note object through. i could have appended the note to a dataset and read it back though...
    creationDate.setTime(newNoteDialog.dataset.NoteId); // set the old creation time on the new note
    const tempNote = new Note( // create the new note with the modified data 
      newNoteTitle.value,
      newNoteContents.value,
      creationDate
    );
    tempNote.modTime = new Date(); //set the new modification time on the note
    const updateRequest = db
      .transaction(objectStoreNameNotes, "readwrite")
      .objectStore(objectStoreNameNotes)
      .put(tempNote, creationDate); //replace the old note with the new one in the IndexedDB
    notebook.length = 0; // clears the array https://stackoverflow.com/a/1232046
    loadFromDB();
    newNoteDialog.dataset.editNote = false;
    newNoteDialog.dataset.NoteId = 0;
  } else { //creating a new note from scratch
    const tempNote = new Note(newNoteTitle.value, newNoteContents.value);
    notebook.push(tempNote); //save note into working array
    saveToDB(tempNote); //save temp note into IndexedDB
    draw();
  }
});

//sorting functions
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
    case "modFirst":
      notebook.sort((a, b) => {
        if (a.modTime && b.modTime) {
          //if the mod times exist see who was made earlier
          return b.modTime - a.modTime;
        }
        if (!a.modTime && !b.modTime) {
          //mod times dont exist for either a or b
          return b.creationTime - a.creationTime;
        }
        if (!a.modTime && b.modTime) {
          // a has no modification time
          return b.modTime - a.creationTime;
        }
        if (a.modTime && !b.modTime) {
          //b has no modification time
          return b.creationTime - a.modTime;
        }
      });
      break;
    case "modLast":
      notebook.sort((a, b) => {
        if (a.modTime && b.modTime) {
          //if the mod times exist see who was made earlier
          return a.modTime - b.modTime;
        }
        if (!a.modTime && !b.modTime) {
          //mod times dont exist for either
          return a.creationTime - b.creationTime;
        }
        if (!a.modTime && b.modTime) {
          // a has no modification time
          return a.creationTime - b.modTime;
        }
        if (a.modTime && !b.modTime) {
          //b has no modification time
          return a.modTime - b.creationTime;
        }
      });
  }
  draw();
});

noteEditCancelButton.addEventListener("click", (e) => { //you dont want to save the note you edited 
  e.preventDefault(); // stop the form from being submitted
  newNoteDialog.close();
});

// ------------------ SCRIPT ENTRYPOINT ----------------- //

//set fonts
document.querySelector("body").className = "noto-serif-georgian-body";
connectToDB();
