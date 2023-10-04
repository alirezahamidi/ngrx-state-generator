const fs = require("fs");
class IO {
  filePath = "";
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

  getParams() {
    const input = process.argv[2];
    let params = process.argv[3];

    if (!params || params == "") params = "crudf";
    else params = params.toLowerCase();
    const outp = {
      input,
      params,
      create: params.indexOf("c") >= 0,
      read: params.indexOf("r") >= 0,
      update: params.indexOf("u") >= 0,
      delete: params.indexOf("d") >= 0,
      facade: params.indexOf("f") >= 0,
      filePath: `${input}-state`,
    };
    this.filePath = `./${outp.filePath}/${outp.input}`;

    return outp;
  }

  handleInput() {
    const { input } = this.getParams();
    if (!input || input == "") {
      console.log("Add --help to see help");
      return -1;
    }

    if (input == "--help") {
      console.log(io.help);
      return -1;
    }
    return 1;
  }

  initFile() {
    let isExist = fs.existsSync(params.filePath);
    if (!isExist) fs.mkdirSync(params.filePath);
  }

  startUpperCaseName() {
    const { input } = this.getParams();
    return input
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
    return input
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

  featureKey() {
    const { input } = this.getParams();
    return (
      input
        .split("-")
        .map((x) => x.toUpperCase())
        .join("_") + "_FEATURE_KEY"
    );
  }

  createFile(data, type) {
    fs.writeFileSync(`${this.filePath}${type=='module'?'-state':''}.${type.toLowerCase()}.ts`, data);
    console.log(`${this.startUpper(type)} File Created!`);
  }
}

module.exports = new IO();
