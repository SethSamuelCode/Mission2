// ----------------------- OBJECTS ---------------------- //

class Note { //class for notes 
  constructor(tittle, text) { //takes title and note content 
    this.tittle = tittle;
    this.note = text;
    this.creationTime = new Date(); //sets the creation time at note creation
  }
}

// ------------------- HTML SELECTORS ------------------- //
const mainDiv = document.getElementsByTagName("main")[0]; //get main element

// https://stackoverflow.com/a/24676492
// function auto_grow(element) {
//   element.style.height = "5em";
//   element.style.height = (element.scrollHeight) + "px";
// }

const notebook = [] //stores the notes
//generate some test data
notebook.push(new Note("tittle", "this is some text"));
notebook.push(new Note("tittle again", "this is text is bomb"));
notebook.push(new Note("3RD note", "this is the text for the 3rd note"));




const newNoteDialog = document.querySelector("dialog");
const newNoteButton = document.getElementById("newNoteButton");
newNoteButton.addEventListener("click", () => {
newNoteDialog.showModal();
});

function draw(){
  for (let note of notebook.values()) {
    console.log(
      "tittle: " +
        note.tittle +
        "\ncontents: " +
        note.note +
        "\ncreated on: " +
        note.creationTime
    );
  
    console.log(JSON.stringify(note))
  
// ------------------- CREATE NOTE IN HTML ------------------ //

    // div to hold the note
    const div = document.createElement("div");
    div.className = "note";
    //note tittle
    const h1 = document.createElement("h1");
    h1.insertAdjacentText("afterbegin", note.tittle);
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

draw(); //draw the webpage on first load