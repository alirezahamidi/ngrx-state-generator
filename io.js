const fs = require("fs");
class IO {
  filePath = "";
  input = "";
  params = "";
  create = true;
  read = true;
  update = true;
  delete = true;
  facade = true;

  upperCaseName = "";
  lowerCaseName = "";
  featureKey = "";
  names = {
    model: null,
    actions: null,
    reducer: null,
    module: null,
    effects: null,
    entity: null,
    selectors: null,
    facade: null,
    service: null,
  };

  help = `
    NGRX State Files Generator : 
        Commands :

        node index your-file-name:
        Basic command will make you basic Read State.

        parameters:

        crudf
        use it when you want to customize state:

        c => create
        r => read
        u => update
        d => delete
        f => facade

        sample crf => Create Read and Facade
        `;

  init() {
    this.getParams();
    this.handleInput();
    this.upperCaseName = this.startUpperCaseName();
    this.lowerCaseName = this.startLowerCaseName();
    this.featureKey = this.getFeatureKey();

    if (this.handleInput() < 0) return -1;
    this.initFile();

    Object.getOwnPropertyNames(this.names).forEach((x) => {
      this.names[x] = {
        className: `${this.startUpper(this.input)}${
          x == "module" ? "State" : ""
        }${this.startUpper(x)}`,
        fileName: `${this.filePath}.${x.toLowerCase()}`,
      };
    });
    return 1;
  }

  getParams() {
    this.input = process.argv[2];
    this.params = process.argv[3];
    if (!this.params || this.params == "") this.params = "crudf";
    else this.params = this.params.toLowerCase();

    this.create = this.params.indexOf("c") >= 0;
    this.read = this.params.indexOf("r") >= 0;
    this.update = this.params.indexOf("u") >= 0;
    this.delete = this.params.indexOf("d") >= 0;
    this.facade = this.params.indexOf("f") >= 0;
    this.filePath = `./${this.input}-state`;

    const outp = {
      input: this.input,
      params: this.params,
      create: this.create,
      read: this.read,
      update: this.update,
      delete: this.delete,
      facade: this.facade,
      filePath: this.filePath,
    };

    return outp;
  }

  handleInput() {
    const { input } = this.getParams();
    if (!input || input == "") {
      console.log("Add --help to see help");
      return -1;
    }

    if (input == "--help") {
      console.log(this.help);
      return -1;
    }
    return 1;
  }

  initFile() {
    let isExist = fs.existsSync(this.filePath);
    if (!isExist) fs.mkdirSync(this.filePath);
  }

  startUpperCaseName() {
    const { input } = this.getParams();
    return this.startUpper(input);
  }

  startUpper(text) {
    return text
      .split("-")
      .map((x) => {
        let a = "";
        for (let i = 0; i < x.length; i++) {
          if (i == 0) a += x[i].toUpperCase();
          else a += x[i].toLowerCase();
        }
        return a;
      })
      .join("");
  }

  startLowerCaseName() {
    const { input } = this.getParams();
    return this.startLower(input);
  }

  startLower(text) {
    return text
      .split("-")
      .map((x, j) => {
        let a = "";
        for (let i = 0; i < x.length; i++) {
          if (i == 0 && j != 0) a += x[i].toUpperCase();
          else a += x[i].toLowerCase();
        }
        return a;
      })
      .join("");
  }

  getFeatureKey() {
    const { input } = this.getParams();
    return (
      input
        .split("-")
        .map((x) => x.toUpperCase())
        .join("_") + "_FEATURE_KEY"
    );
  }

  createFile(data, fileName) {
    fs.writeFileSync(`${this.filePath}/${fileName}.ts`, data);
    console.log(`${fileName} File Created!`);
  }
}

module.exports = new IO();
