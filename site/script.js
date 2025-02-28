class Note { //class for notes 
  constructor(tittle, text) { //takes title and note content 
    this.tittle = tittle;
    this.note = text;
    this.creationTime = new Date(); //sets the creation time at note creation
  }
}

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

let mainDiv = document.getElementsByTagName("main")[0]; //get main element



for (let x of notebook.values()) {
  console.log(
    "tittle: " +
      x.tittle +
      "\ncontents: " +
      x.note +
      "\ncreated on: " +
      x.creationTime
  );

  console.log(JSON.stringify(x))

  // div to hold the note
  let div = document.createElement("div");
  div.className = "note";
  //note tittle
  let h1 = document.createElement("h1");
  h1.insertAdjacentText("afterbegin", x.tittle);
  //note content
  let content = document.createElement("p");
  content.insertAdjacentText("afterbegin", x.note);
  //div to hold creation date
  let creationDateDiv = document.createElement("div");
  creationDateDiv.className = "creationDate";
  //label for creation date
  let labelForCreationDate = document.createElement("p");
  labelForCreationDate.insertAdjacentText("afterbegin", "Creation Date: ");
  //creation date
  let creationDate = document.createElement("p");
  creationDate.insertAdjacentText("afterbegin", x.creationTime);

  div.append(h1);

  div.append(content);
  creationDateDiv.append(labelForCreationDate);
  creationDateDiv.append(creationDate);
  div.append(creationDateDiv);
  mainDiv.append(div);
}

const newNoteDialog = document.querySelector("dialog");
const newNoteButton = document.getElementById("newNoteButton");
newNoteButton.addEventListener("click", () => {
newNoteDialog.showModal();
});
// mainDiv = document.getElementById("main");

// div.innerHTML="Hello World";
// mainDiv.append(div);

