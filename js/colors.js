function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToObj_Rgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function hexToRgb(hex) {
  return(Obj_RgbToRgb(hexToObj_Rgb(hex)));
}

function Obj_RgbToRgb(color) {
  return rgb(color.r,color.g,color.b);
}

function rgb(r, g, b) {
  r = Math.floor(r); g = Math.floor(g); b = Math.floor(b);
  return ["rgb(",r,",",g,",",b,")"].join("");
}

function rgb2array(rgb) {
  return rgb.match(/\d+/g);
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param     r       The red color value
 * @param     g       The green color value
 * @param     b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param     h       The hue
 * @param     s       The saturation
 * @param     l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [ r * 255, g * 255, b * 255 ];
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param     r       The red color value
 * @param     g       The green color value
 * @param     b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;

  let d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, v ];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param     h       The hue
 * @param     s       The saturation
 * @param     v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v) {
  let r, g, b;

  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return [ r * 255, g * 255, b * 255 ];
}

function getRandomHexColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function rndColor(defaults) {
  let c = hexToObj_Rgb(getRandomHexColor());
  if (defaults !== undefined) {
      return Obj_RgbToRgb({
        r: defaults.r !== null ? defaults.r : c.r,
        g: defaults.g !== null ? defaults.g : c.g,
        b: defaults.b !== null ? defaults.b : c.b
      });
  }
  else return Obj_RgbToRgb(c);
}

function rndColorRange(ranges) {
  let color = rgb(
      Math.floor(rndRange(ranges.red.min,ranges.red.max)),
      Math.floor(rndRange(ranges.green.min,ranges.green.max)),
      Math.floor(rndRange(ranges.blue.min,ranges.blue.max)));
  return color;
}

function rndRange(min,max) {
  let range = max - min;
  let n = Math.random() * range;
  return min + n;
}

function invertColor(hex) {
  let color = hexToObj_Rgb(hex);
  return rgb(255-color.r,255-color.g,255-color.b);
}