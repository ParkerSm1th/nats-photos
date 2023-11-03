import Jimp from "jimp";

const attachSmallLogo = (
  image: Jimp,
  logo: Jimp,
  x: "left" | "right",
  y: "top" | "bottom"
): Jimp => {
  const X = image.bitmap.width / 8;
  const Y = image.bitmap.height / 8;
  return image.composite(
    logo,
    x === "left" ? X : X * 7 - logo.bitmap.width,
    y === "top" ? Y : Y * 7 - logo.bitmap.height
  );
};

export class WatermarkService {
  logo: Jimp;
  constructor(logo: Jimp) {
    this.logo = logo;
  }
  async getWatermarkedImage(url: string): Promise<Jimp> {
    const image = await Jimp.read(url);

    const X = image.bitmap.width / 2 - this.logo.bitmap.width / 2;
    const Y = image.bitmap.height / 2 - this.logo.bitmap.height / 2;

    const newImage = image.composite(this.logo, X, Y);
    this.logo.resize(50, 50);
    let finalImage = newImage;
    finalImage = attachSmallLogo(finalImage, this.logo, "left", "top");
    finalImage = attachSmallLogo(finalImage, this.logo, "left", "bottom");
    finalImage = attachSmallLogo(finalImage, this.logo, "right", "top");
    finalImage = attachSmallLogo(finalImage, this.logo, "right", "bottom");
    return finalImage;
  }
}
