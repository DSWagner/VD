const fs = require("fs");
const path = require("path");

// Assuming the script is run from the project root
const directoryPath = path.join(
  __dirname,
  "..",
  "public",
  "Dataset",
  "3d_models"
);
const outputPath = path.join(__dirname, "..", "public", "fileList.json");

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.log("Unable to scan directory: " + err);
  }

  const jsonData = JSON.stringify(files);
  fs.writeFile(outputPath, jsonData, (err) => {
    if (err) return console.log(err);
    console.log("File list JSON generated successfully.");
  });
});
