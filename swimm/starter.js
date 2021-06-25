// ####### UTILITY FUNCTIONS #########

function renderItem(dataPoint, key, value, template) {
  const id = `${dataPoint}-${key}`;
  const list = document.getElementById(dataPoint);
  list.innerHTML += `<div id=${id}>${template.split('{{key}}').join(key)}</div>`;
  const cell = document.getElementById(id);
  cell.innerHTML = cell.innerHTML.split('{{value}}'.toString()).join(value);
}

/*
Iterating over the documents and files,
If a file object exists, add the doc to this object
Otherwise, create a new file object and insert the document.
parameters: docs - the original documents object
return: filesWithDocs- an object of files, where each file has an
array of the documents it's mentioned in
 */
function flip(docs) {
  const filesWithDocs = {}; // The swapped document list
  Object.entries(docs).forEach(([doc, files]) => {
    files.forEach((file) => {
      if (filesWithDocs[file] && !filesWithDocs[file].includes(doc)) filesWithDocs[file].push(doc);
      else filesWithDocs[file] = new Array(doc);
    });
  });
  return filesWithDocs;
}
// ######### RENDERER CLASS ##########
class SwimmTemplateRenderer {
  constructor(data, template, el) {
    this.data = { ...data };
    this.template = template;
    this.el = el;
    this.render();
  }

  render() {
    const swimmForRegex = /<swimm for \(key, value\) in (.*?)>\n(.*)\n\s\s*?<\/swimm>/g;
    const renderedTemplate = this.template.replace(swimmForRegex, '<div id="$1"></div>');
    document.getElementById(this.el).innerHTML = renderedTemplate;
    const matches = [...this.template.matchAll(swimmForRegex)];
    /* we swapped the old loop with forEach loop, https://eslint.org/docs/rules/guard-for-in
    "Looping over objects with a for in loop will include properties that are inherited through the
    prototype chain. This behavior can lead to unexpected items in your for loop."
    */
    Object.keys(matches).forEach((match) => {
      const dataPoint = matches[match][1];
      // swapping the docs object
      const swap = flip(this.data[dataPoint]);
      const template = matches[match][2];
      Object.keys(swap).forEach((key) => renderItem(dataPoint, key, swap[key], template));
    });
  }

  addDoc() {
    const input1 = document.querySelector('#path');
    const fileList = input1.value.replace(' ', '').split(',');
    const input2 = document.querySelector('#doc');
    const docList = input2.value.replace(' ', '').split(',');
    if (input1.value !== '' && input2.value !== '') {
      docList.forEach((doc) => {
        if (!this.data.docs[doc]) {
          this.data.docs[doc] = [];
        }
        fileList.forEach((file) => {
          if (!this.data.docs[doc].includes(file)) {
            this.data.docs[doc].push(file);
          }
        });
      });
      this.render();
    } else {
      alert('Please fill out the form');
    }
  }
}

// ############### MAIN ##################

// Provided data from assignment
const docs = {
  Doc1: ['src/app.js', 'src/app.spec.js'],
  Doc2: ['webpack.config.js', 'src/app.js'],
};

// Template to render
const template = `
<div class="container">
  <div class="listDiv">
    <div class="caption">Swimm Coverage</div>
    <ul class="list">
      <swimm for (key, value) in docs>
        <li class="line"> <div class="liKey">{{key}}</div> <div class="liValue">{{value}}</div></li>
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
        <button class="btn" onclick="renderer.addDoc()">Submit</button>
      </div>
    </div>
    </div>
  </div>
</div>
`;

// Create new renderer
const renderer = new SwimmTemplateRenderer({ docs }, template, 'app');

// ######################################################################
// BONUS: Proxy, enable changing the documents object through the console.
// ######################################################################

// Proxy handler configures what happens when you use GET or SET.
// Return: GET - document data
// Return: SET - true if successful
const handler = {

  get(data, prop) { // getting the data
    return data.docs[prop];
  },
  set(data, prop, val) {
    if (prop !== '' && val !== '') {
      console.log(val[0]);
      const newProp = prop.replace(' ', '').split(',');
      Object.keys(newProp).forEach((props) => {
        if (typeof (val) === 'object') {
          if (!data.docs[newProp[props]]) {
            renderer.data.docs[newProp[props]] = [];
          }
          val.forEach((file) => {
            if (file !== '') {
              if (!renderer.data.docs[newProp[props]].includes(file)) {
                renderer.data.docs[newProp[props]].push(file);
              }
            } else {
              alert('Please fill the proxy currectly');
            }
          });
        }
      });
      renderer.render();
      return true;
    }
    alert('Please fill the proxy currectly');
    return false;
  },
};

// Use the proxy on our data object
const coverage = new Proxy(renderer.data, handler);

/* ############## How to use Proxy ######################
Perform some operations on the target using proxy
SET
coverage['Doc3'] = ['a.js','b.js'];
coverage['Doc2'] = ['aaaa.js','bbbb.js'];
coverage['Doc3'] = ['333333.js','111111.js'];

GET
console.log( 'data.name ->', coverage['Doc3'] );
console.log( '"coverage.data" ->', data );
console.log( 'coverage.data.doc will give you the data')
###################################################### */
