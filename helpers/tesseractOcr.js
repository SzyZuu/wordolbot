const fs = require('fs');
const sharp = require('sharp');
const modelData = fs.readFileSync('eng.traineddata');

module.exports = {
	extractWordleNumber : async (attachmentUrl) => {
		const { createOCREngine } = await import('tesseract-wasm');
		const { loadWasmBinary } = await import('tesseract-wasm/node');
		const wasmBinary = await loadWasmBinary();
		const response = await fetch(attachmentUrl);
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

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

		return text.replace(/\D/g, '');
	},
};