const URL = "./model/";

let model, labelContainer;

async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    console.log("Model Loaded");
}

loadModel();

const imageUpload = document.getElementById("imageUpload");
const preview = document.getElementById("preview");
const dropArea = document.getElementById("drop-area");
const loader = document.getElementById("loader");
const resetBtn = document.getElementById("resetBtn");

labelContainer = document.getElementById("label-container");

// 📁 File Upload
imageUpload.addEventListener("change", function (e) {
    const file = e.target.files[0];
    handleImage(file);
});

// 🖱️ Drag & Drop
dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
});

dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImage(file);
});

// 🔍 Handle Image
function handleImage(file) {
    const reader = new FileReader();

    reader.onload = function () {
        preview.src = reader.result;
        preview.onload = () => predict(preview);
    };

    reader.readAsDataURL(file);
}

// 🤖 Prediction
async function predict(image) {
    loader.classList.remove("hidden"); // show loader
    labelContainer.innerHTML = "";

    const prediction = await model.predict(image);

    loader.classList.add("hidden"); // hide loader

    let top = prediction.reduce((a, b) =>
        a.probability > b.probability ? a : b
    );

    prediction.forEach(p => {
        const percent = (p.probability * 100).toFixed(2);
        labelContainer.innerHTML += `<p>${p.className}: ${percent}%</p>`;
    });

  
   // Normalize class name
const className = top.className.toLowerCase();

// 🌿 Final Result + Suggestions
if (className.includes("unhealthy")) {
    labelContainer.innerHTML += `
      <h2 style="color:red">⚠️ Plant is Unhealthy</h2>
      <p>💡 Suggestion: Check water levels, sunlight, and possible pests.</p>
    `;
} else if (className.includes("healthy")) {
    labelContainer.innerHTML += `
      <h2 style="color:green">🌿 Plant is Healthy</h2>
      <p>✅ Keep maintaining proper sunlight and watering.</p>
    `;
} else {
    labelContainer.innerHTML += `
      <h2>🤔 Not sure</h2>
      <p>Try a clearer image</p>
    `;
}
}

// 🔄 Reset
resetBtn.addEventListener("click", () => {
    preview.src = "";
    labelContainer.innerHTML = "";
    imageUpload.value = "";
});