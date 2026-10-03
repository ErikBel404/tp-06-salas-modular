const js = require("@eslint/js");
module.exports = [{
   files: ["src/**/*.js"], ...js.configs.recommended, languageOptions: {
      sourceType: "commonjs", globals: { __dirname: "readonly", console: "readonly", module: "readonly", process: "readonly", require: "readonly" }
   }
}];