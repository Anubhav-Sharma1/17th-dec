//variable for taking input image
const imageInput = document.getElementById("image-in");
//variable for storing the selected image for output
const imageOut = document.getElementById("image-out");
// making canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const drawCircleButton = document.getElementById("draw-circle");
const clearCircleButton = document.getElementById("clear-circle");

/**
 * creating a class Circle
 */
class Circle {
  constructor(id, x, y, radius, color) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  /**
   * draw function helps to draw a circle
   * @param (ctx) is used as a parameter which helps to tell where
   * the circle will be drawn
   */
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  /**
   * determines whether a point represented by the mouse position
   * (mouseX, mouseY) falls within a circular area defined by a center
   * (this.x, this.y) and a radius this.radius
   */
  isClicked(mouseX, mouseY) {
    const dist = Math.sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2);
    return dist <= this.radius;
  }
}
//creating a map to track all the circles with their id
const circlesMap = new Map();
let nextCircleId = 1;
const maxCircles = 5;

let selectedCircle = null;
let isDragging = false;

// Prevent image from being dragged by disabling the default behavior
imageOut.ondragstart = (e) => e.preventDefault();

//Handle image upload
imageInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imageOut.src = e.target.result;

      imageOut.onload = () => {
        canvas.width = imageOut.naturalWidth;
        canvas.height = imageOut.naturalHeight;

        // Set canvas display size to match image size
        canvas.style.width = `${imageOut.width}px`;
        canvas.style.height = `${imageOut.height}px`;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCanvas();
      };
    };
    reader.readAsDataURL(file);
  }
});

//Draw a circle
drawCircleButton.addEventListener("click", function () {
  if (circlesMap.size < maxCircles) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 20 + 10;
    const color = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, ${Math.floor(Math.random() * 255)})`;
    //creating an object of the class Circle
    const circle = new Circle(nextCircleId, x, y, radius, color);
    circlesMap.set(nextCircleId, circle);
    nextCircleId++;
    redrawCanvas();
  } else {
    alert("Maximum of 5 circles reached.");
  }
});

//redraw the canvas
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const circle of circlesMap.values()) {
    circle.draw(ctx);
  }
}
// Get mouse position relative to canvas
function getMousePos(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mouseX = (event.clientX - rect.left) * scaleX;
  const mouseY = (event.clientY - rect.top) * scaleY;

  return { mouseX, mouseY };
}

// Select a circle with the mouse
canvas.addEventListener("mousedown", function (event) {
  const { mouseX, mouseY } = getMousePos(event);

  for (const circle of circlesMap.values()) {
    if (circle.isClicked(mouseX, mouseY)) {
      selectedCircle = circle;
      isDragging = true;
      break;
    }
  }
});
// Move the selected circle as the mouse is dragged
canvas.addEventListener("mousemove", function (event) {
  if (isDragging && selectedCircle) {
    const { mouseX, mouseY } = getMousePos(event);

    // Ensure the circle stays within the canvas boundaries
    selectedCircle.x = Math.min(
      Math.max(selectedCircle.radius, mouseX),
      canvas.width - selectedCircle.radius
    );
    selectedCircle.y = Math.min(
      Math.max(selectedCircle.radius, mouseY),
      canvas.height - selectedCircle.radius
    );

    redrawCanvas();
  }
});

// Deselect the circle when the mouse button is released
canvas.addEventListener("mouseup", function () {
  isDragging = false;
});

// Deselect the circle if the mouse leaves the canvas
canvas.addEventListener("mouseleave", function () {
  isDragging = false;
});

// Clear selected circle after 3 seconds using promises
function clearSelectedCircle() {
  return new Promise((resolve, reject) => {
    if (!selectedCircle) {
      reject("No circle is selected.");
      return;
    }
    let var1 =selectedCircle;
    selectedCircle=null;

    // Delay the action without notifying user
    setTimeout(() => {
      const idToDelete = var1.id;

      // Remove the selected circle from the map
      if (circlesMap.has(idToDelete)) {
        circlesMap.delete(idToDelete);
        var1 = null;
        redrawCanvas();
        resolve("Circle cleared successfully.");
      } else {
        reject("Selected circle not found.");
      }
    }, 3000); // Delay of 3 seconds
  });
}

// Event listener for the clear button
clearCircleButton.addEventListener("click", () => {
  clearSelectedCircle()
    .then((message) => {
      console.log(message); // Log success message
    })
    .catch((error) => {
      console.error(error); // Log error message
    });
});
