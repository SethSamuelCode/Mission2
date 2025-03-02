// ----------------------- OBJECTS ---------------------- //

class Note {
  //class for notes
  constructor(title, text) {
    //takes title and note content
    this.title = title;
    this.note = text;
    this.creationTime = new Date(); //sets the creation time at note creation
  }
}



// https://stackoverflow.com/a/24676492
// function auto_grow(element) {
//   element.style.height = "5em";
//   element.style.height = (element.scrollHeight) + "px";
// }

// ------------------ GLOBAL VARIABLES ------------------ //

const notebook = []; //stores the notes

// ------------------- HTML SELECTORS ------------------- //
const mainDiv = document.getElementsByTagName("main")[0]; //get main element
const newNoteDialog = document.querySelector("#newNoteDialog");
const newNoteButton = document.getElementById("newNoteButton");
const newNoteTitle = document.querySelector("#newNoteDialog input");
const newNoteContents = document.querySelector("#newNoteDialog textarea")
const newNoteDialogSaveButton = document.querySelector("#newNoteDialog button");
const sortButton = document.querySelector("#sortForm input");
const sortDirection = document.querySelector("#sortBySelect")


// ---------------------- FUNCTIONS ---------------------- //

function draw() {

  mainDiv.innerHTML=""; //clear main div for redraw 

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
    creationDate.insertAdjacentText("afterbegin", note.creationTime);

    //append everything in order
    div.append(h1);
    div.append(content);
    creationDateDiv.append(labelForCreationDate);
    creationDateDiv.append(creationDate);
    div.append(creationDateDiv);
    mainDiv.append(div);
  }
}

// ------------------- EVENT LISTENERS ------------------ //

newNoteButton.addEventListener("click", () => { //open the new note modal
  newNoteTitle.value = ""; //clear title on modal open
  newNoteContents.value = "" //clear text area on modal open
  newNoteDialog.showModal();
});

newNoteDialogSaveButton.addEventListener("click", () =>{ //button to save the note in the new note modal
  notebook.push(new Note(newNoteTitle.value,newNoteContents.value));
  draw()
});

sortButton.addEventListener("click",()=>{ //sorting functions

  switch (sortDirection.value){
  case "a-z": notebook.sort((a,b)=>{ //sort by Title A-Z
    return a.title.localeCompare(b.title);
  }) ;
  break;
  case "z-a": notebook.sort((a,b)=>{ //sort by Title Z-A
    return b.title.localeCompare(a.title) 
  });
  break;
  case "newest": notebook.sort((a,b)=>{ //sort by newest note first
    console.log(b.creationTime - a.creationTime)
    return (b.creationTime - a.creationTime)//"b" goes first because the Date object stores the time as Unix time. thus an object created later will have a bigger number. since we want the biggest "time value" to be first a bigger number minus a smaller number will create a positive value meaning when it is returned "a" will be placed ahead of "b" .
  })
  break;
  case "oldest": notebook.sort((a,b)=>{
    return a.creationTime - b.creationTime; //opposite of above 
  })
  break;

}
  draw()
})

// ------------------ SCRIPT ENTRYPOINT ----------------- //

//generate some test data
notebook.push(new Note("title", "this is some text"));
notebook.push(new Note("title again", "this is text is bomb"));
notebook.push(new Note("3RD note", "this is the text for the 3rd note"));

draw(); //draw the webpage on first load
