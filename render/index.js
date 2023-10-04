// Finds all image elements with class name "punchcard" and
// replace the src attribute with an SVG base64 graphic of
// a punch card with the binary representation of the text
// present on the data-text attribute of the element
document.addEventListener("DOMContentLoaded", function () {
  const punchCardImages = document.getElementsByClassName("punchcard");

  for (const punchCardImage of punchCardImages) {
    const text = punchCardImage.dataset.text;
    punchCardImage.src = generatePunchCardSVG(text);
  }
});

/** Generates a SVG base64 string from the given text */
function generatePunchCardSVG(text) {
  const INVERTED_COLORS = false;
  const BG_COLOR = INVERTED_COLORS ? "#ffffff" : "#000000";
  const FG_COLOR = INVERTED_COLORS ? "#000000" : "#ffffff";
  const SECTIONS = textToSections(text);
  const BORDER = 20;
  const SECTION_WIDTH = 80;
  const HEIGHT = 160;
  const WIDTH = 2 * SECTION_WIDTH + SECTIONS.length * SECTION_WIDTH;

  // Create a SVG element
  const SVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  SVG.setAttribute("preserveAspectRatio", "xMinYMin meet");
  SVG.setAttribute("width", WIDTH + 2 * BORDER);
  SVG.setAttribute("height", HEIGHT + 2 * BORDER);

  // Draw the background
  const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bgRect.setAttribute("x", "0");
  bgRect.setAttribute("y", "0");
  bgRect.setAttribute("width", WIDTH + 2 * BORDER);
  bgRect.setAttribute("height", HEIGHT + 2 * BORDER);
  bgRect.setAttribute("fill", BG_COLOR);
  SVG.appendChild(bgRect);

  // Begin drawing at the end of the left border
  let DRAW_POS = BORDER;

  // Draw the first circle
  drawCircle(
    DRAW_POS + SECTION_WIDTH / 2,
    BORDER + HEIGHT / 2,
    SECTION_WIDTH / 4,
    SVG,
    FG_COLOR
  );
  DRAW_POS += SECTION_WIDTH;

  // Draw each section
  for (const section of SECTIONS) {
    if (section[0]) {
      drawCircle(
        DRAW_POS + SECTION_WIDTH / 4,
        BORDER + HEIGHT / 4 / 2,
        SECTION_WIDTH / 8,
        SVG,
        FG_COLOR
      );
    }
    if (section[1]) {
      drawCircle(
        DRAW_POS + SECTION_WIDTH / 4,
        BORDER + (HEIGHT / 4 / 2) * 3,
        SECTION_WIDTH / 8,
        SVG,
        FG_COLOR
      );
    }
    if (section[2]) {
      drawCircle(
        DRAW_POS + SECTION_WIDTH / 4,
        BORDER + (HEIGHT / 4 / 2) * 5,
        SECTION_WIDTH / 8,
        SVG,
        FG_COLOR
      );
    }
    if (section[3]) {
      drawCircle(
        DRAW_POS + SECTION_WIDTH / 4,
        BORDER + (HEIGHT / 4 / 2) * 7,
        SECTION_WIDTH / 8,
        SVG,
        FG_COLOR
      );
    }
    if (section[4]) {
      drawCircle(
        DRAW_POS + (SECTION_WIDTH / 4) * 3,
        BORDER + HEIGHT / 4 / 2,
        SECTION_WIDTH / 8,
        SVG,
        FG_COLOR
      );
    }
    if (section[5]) {
      drawCircle(
        DRAW_POS + (SECTION_WIDTH / 4) * 3,
        BORDER + (HEIGHT / 4 / 2) * 3,
        SECTION_WIDTH / 8,
        SVG,
        FG_COLOR
      );
    }
    if (section[6]) {
      drawCircle(
        DRAW_POS + (SECTION_WIDTH / 4) * 3,
        BORDER + (HEIGHT / 4 / 2) * 5,
        SECTION_WIDTH / 8,
        SVG,
        FG_COLOR
      );
    }
    if (section[7]) {
      drawCircle(
        DRAW_POS + (SECTION_WIDTH / 4) * 3,
        BORDER + (HEIGHT / 4 / 2) * 7,
        SECTION_WIDTH / 8,
        SVG,
        FG_COLOR
      );
    }

    DRAW_POS += SECTION_WIDTH;
  }

  // Draw the last circle
  drawCircle(
    DRAW_POS + SECTION_WIDTH / 2,
    BORDER + HEIGHT / 2,
    SECTION_WIDTH / 4,
    SVG,
    FG_COLOR
  );
  DRAW_POS += SECTION_WIDTH;

  // Return the SVG as an embeddable string
  const svgData = new XMLSerializer().serializeToString(SVG);
  return "data:image/svg+xml;base64," + btoa(svgData);
}

/**
 * Converts the given text string to an array of bytes
 * A byte is represented by an 8 length array of booleans
 */
function textToSections(text) {
  return text.split("").map((char) => {
    const bin = char.charCodeAt().toString(2);
    return bin
      .padStart(8, "0")
      .split("")
      .map((bit) => bit === "1");
  });
}

/** Adds a circle to the given SVG element */
function drawCircle(x, y, radius, svg, fill) {
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", radius);
  circle.setAttribute("fill", fill);
  svg.appendChild(circle);
}
