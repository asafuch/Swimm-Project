function SwimmTemplateRenderer(options) {
	this.data = { ...options.data };
  this.template = options.template;
  this.el = options.el;
  this._init();
  this._render();
}

SwimmTemplateRenderer.prototype._init = function() {
  
}

SwimmTemplateRenderer.prototype._renderItemValue = function (id, newVal, oldVal) {
  let cell = document.getElementById(id);
  cell.innerHTML = cell.innerHTML.split(oldVal.toString()).join(newVal);
}

SwimmTemplateRenderer.prototype._renderItem = function (dataPoint, key, value, tmplt) {
  // console.log('_renderItem', dataPoint, key, value, tmplt);
	const id = dataPoint + "-" + key;

  const list = document.getElementById(dataPoint);
  

  list.innerHTML += `<div id=${id}>` + tmplt.split('{{key}}').join(key) + `</div>`;

  this._renderItemValue(id, value, '{{value}}');
}

SwimmTemplateRenderer.prototype._render = function() {
  const swimmForRegex = /<swimm for \(key, value\) in (.*?)>\n(.*)\n\s\s*?<\/swimm>/g;
  
  let renderedTemplate = this.template.replaceAll(swimmForRegex, '<div id="$1"></div>');
  
  document.getElementById(this.el).innerHTML = renderedTemplate;
    
  const matches = [...this.template.matchAll(swimmForRegex)];
  
  for (var match in matches) {
  	const dataPoint = matches[match][1];
    console.log('dataPoint',this.data[dataPoint]);
    /*##################################################*/
    //swapping the docs object
    let swap = newFlip(this.data[dataPoint]) 
    /*##################################################*/
    const tmplt = matches[match][2];
    const keyCells = Object.keys(swap).map( (key) => this._renderItem(dataPoint, key, swap[key], tmplt));
  }
}

/*
function name: newFlip
description: swapping the docs object
parameters: docs-the original documents object
return:docsnew-the new swaped object
author:asaf 
created date: 23/06/2021
 */
const newFlip=docs=>{
  //the swapped object to be return
  docsnew = {}
  //looping through docs
  Object.entries(docs).map(([doc,files], i)=>{
    //mapping through the files array
    files.map(file =>{
      //if exists pushing to docs array
      if(docsnew[file]){
        docsnew[file].push(doc)
      }
      //if not exists creating a new docs array
      else{
        docsnew[file] = new Array(doc)
      }
    })
  })
  //returning the new swapped object
  return docsnew
}



let docs = {
	'Doc1': ['src/app.js', 'src/app.spec.js'],
  'Doc2': ['webpack.config.js', 'src/app.js'],
  
}

let data = { 
	docs
};

/*
function name: addDoc
description: adding new entry to the docs object
parameters:
return:
author:asaf 
created date: 23/06/2021
 */

const addDoc = () => {
   const input1=document.querySelector("#path")
   //taking the files from the input, removing spacebars and splitting it into an aray
   const fileList=input1.value.replace(" ","").split(",") 
   const input2=document.querySelector("#doc")
   //taking the files from the input, removing spacebars and splitting it into an aray
   const docList=input2.value.replace(" ","").split(",") 
   //looping over our newly created docList and for each doc (can add few documents at once)
   docList.forEach(doc => {
      // if(doc.toLowerCase().includes("doc")){ (If you want the documents names to be "Doc" only)

      // setting docs[the document name] to be equal to our file list,
       docs[doc]=fileList 
      // }
   });
   
   
   //calling a rerender
   let coverageRender = new SwimmTemplateRenderer({
    data,
    template,
    el: 'app'
  });

}

let template = `
	<div class="container">
    <div class="listDiv">
      <div class="caption">Swimm Coverage</div>
      <ul class="list">
        <swimm for (key, value) in docs>
          <li class="line">{{key}}: {{value}}</li>
        </swimm>
      </ul>
    </div>
    <div class="inputContainer">
      <div id="newLog">
      <div class="caption">Add Docs</div>
      <div class="divForm">
        <div>
          <label class="label" for="doc">Document: </label>
          <input class="input" id="doc"/>
        </div>
        <div class="pathDiv">
          <label class="label" for="File List">File List: </label>
          <input class="input" id="path"/>
        </div>
        <div>
          <button class="btn" onclick="addDoc()">Submit</button>
        </div>
      </div>
      </div>
    </div>
	</div>
`;

let coverageRender = new SwimmTemplateRenderer({
	data,
  template,
  el: 'app'
});

//bonus


/*
function name: coverage
description: enabling the proxy, changing the docs object through the browser console
parameters: data (object that wrap the docs object)
return: for GET- returns the docs data, for SET-returns true if succesful
author:asaf 
created date: 24/06/2021
 */
const coverage = new Proxy( data, {
  //getting the data
  get: function( target, prop, receiver ) {
      //if the word "coverage[the required doc array in here]" is the get function
      const val = data.docs[ prop ];
      //returns the array
      return val;
  },
  set: function( data, prop, val, receiver ) {
      //if the new entry aka prop contains spacebars, remove them. and if it contains "," inside the string we split it into an array
      const newProp=prop.replace(" ","").split(",")
      //for the amount of props inside our newProp we loop
      for(props in newProp) {
        //if the prop exist already inside our docs object
        if( data.docs[newProp[props]] ) {
          //and if the type of it is an object , we concat it with the new value
          if(typeof(val)==="object"){
            data.docs[ newProp[props] ] = data.docs[newProp[props]].concat(val);
          }
          
       } 
       //if its not exist, we create a new entry and add the value to it
       else {
          if(typeof(val)==="object"){
            data.docs[ newProp[props] ] = val;
          }
        }
      };
      //force a rerender
      let coverageRender = new SwimmTemplateRenderer({
        data,
        template,
        el: 'app'
      });
      return true; // operation was successful
  }
} );
/*###################### How to use Proxy ######################*/
// perform some operation on the `target` using `proxy`
/* SET
coverage['Doc3'] = ['a.js','b.js']; // set
coverage['Doc2'] = ['aaaa.js','bbbb.js'] // set
coverage['Doc3'] = ['333333.js','111111.js'];
*/
/* GET
console.log( 'data.name ->', coverage['Doc3'] );  // get
*/

/*
console.log( '"coverage.data" ->', data );
console.log( 'coverage.data.doc will give you the data')
*/
/*############################################################*/


/* This was the first algorithm i ran to swap the docs object, it works but it is slower & complicated to understand 
  const objectFlip = (docFileList) => {
  let fileDocList = {} // all files and the docs that mention them. typical object look like this: {file:[doc1,doc2]}
  let allDocs = [] //an array of all documents 
  let allFiles=[] //an array of all files
  // we iterate over the docfilelist to find all the documents and all the files
  // while checking for duplicated files
  Object.entries(docFileList).forEach(([doc,files]) => {
    allDocs.push(doc) //add doc to all doc list
    files.forEach(file => { //if file is not yet in all file list add it to the list
      if(!allFiles.includes(file)){
        allFiles.push(file)
      }
      });
  })
  //for each file check in which document it appears
  allFiles.forEach(file => {
    let docsOfFile=[] //array of all the documents that mention the file
    Object.entries(docFileList).forEach(([doc,files]) => {//going over the original object again
      if(files.includes(file)){// file is each file inside allFiles, if it is includes in the files array from the original object we push the document
        docsOfFile.push(doc)
      }
    })
    fileDocList[file]=docsOfFile//inside our "result object" at the key of -file, we push the document relevant for it
  });
  return fileDocList
}

*/