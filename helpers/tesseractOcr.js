const fs = require('fs');
const sharp = require('sharp');
const { createOCREngine } = require('tesseract-wasm');
const { loadWasmBinary } = require('tesseract-wasm/node');
const modelData = fs.readFileSync('eng.traineddata');

module.exports = {
	extractWordleNumber : async (attachmentUrl) => {
		const wasmBinary = await loadWasmBinary();
		console.log('Fetching image...');
		const response = await fetch(attachmentUrl);
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		console.log('Decoding image...');
		const image = await sharp(buffer).ensureAlpha();
		const { width, height } = await image.metadata();
		const rawPixels = await image.raw().toBuffer();

		const engine = await createOCREngine({ wasmBinary });
		engine.loadModel(modelData);

		engine.loadImage({
			data: rawPixels,
			width: width,
			height: height,
		});

		const text = engine.getText();

		engine.destroy();

		console.log('Raw Extracted text:\n', text);

		return text.replace(/\D/g, '');
	},
};