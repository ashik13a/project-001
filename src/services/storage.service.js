const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const uploadImage = async ({
  file,
  fileName,
  folder = "/timber-business",
}) => {
  const result = await imagekit.upload({
    file,
    fileName,
    folder,
  });

  return {
    url: result.url,
    fileId: result.fileId,
    name: result.name,
  };
};

module.exports = {
  uploadImage,
};