
const fs = require("fs");
const path = require("path");

const files = ["low.json", "mid.json", "pro.json"];

function encode(value) {
  return Buffer.from(String(value), "utf8").toString("base64");
}

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const converted = data.map(q => {
    const copy = { ...q };

    if (q.type === "mcq" && q.answer !== undefined) {
      copy.answer_b64 = encode(q.answer);
      delete copy.answer;
    }

    if (q.type === "predict" && q.answerText !== undefined) {
      copy.answer_b64 = encode(q.answerText);
      delete copy.answerText;
    }

    return copy;
  });

  fs.writeFileSync(
    filePath,
    JSON.stringify(converted, null, 2),
    "utf8"
  );

  console.log(`✔ Obfuscated: ${file}`);
});
