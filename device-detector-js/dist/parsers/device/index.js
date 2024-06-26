import CameraParser from "./cameras";
import MobileParser from "./mobiles";
import TelevisionParser from "./televisions";
import CarParser from "./cars";
import ConsoleParser from "./consoles";
import NotebookParser from "./notebooks";
import PortableMediaPlayerParser from "./portable-media-players";
const deviceParsers = [
  ConsoleParser,
  CarParser,
  CameraParser,
  TelevisionParser,
  PortableMediaPlayerParser,
  MobileParser,
  NotebookParser,
];
export default class ClientParser {
  constructor() {
    this.parse = (userAgent) => {
      for (const Parser of deviceParsers) {
        const parser = new Parser();
        const device = parser.parse(userAgent);
        if (device.type !== "") {
          return device;
        }
      }
      return null;
    };
  }
}
