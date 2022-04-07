export default class Utils {
  static uint32ToRgba(uint32) {
    let r = (uint32 >> 24) & 0xff;
    let g = (uint32 >> 16) & 0xff;
    let b = (uint32 >> 8) & 0xff;
    let a = uint32 & 0xff || 255;
    console.log(r, g, b, a);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  static rgbaToUint32(color) {
    //color is like rgb(1, 1, 1), use regex to get the number
    let rgba = color.match(/\d+/g);
    //convert to uint32
    let r = parseInt(rgba[0]);
    let g = parseInt(rgba[1]);
    let b = parseInt(rgba[2]);
    let a = parseInt(rgba[3]) || 255;
    return ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
  }
}
