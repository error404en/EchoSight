let lastSpoken = "";

async function detectObjects() {
  const predictions = await model.detect(video);

  if (predictions.length > 0) {
    let currentObject = predictions[0].class;

    // Speak only if object changed
    if (currentObject !== lastSpoken) {
      lastSpoken = currentObject;
      speak("I see " + currentObject);
    }
  }

  requestAnimationFrame(detectObjects);
}
