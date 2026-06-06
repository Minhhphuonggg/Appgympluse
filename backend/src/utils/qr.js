const QRCode = require("qrcode");

async function generateQrDataUrl(text) {
  return QRCode.toDataURL(text);
}

module.exports = {
  generateQrDataUrl,
};
