const { Canvas } = require('skia-canvas')

async function createImage(){
    let canvas = new Canvas(500, 200),
        ctx = canvas.getContext("2d"),
        {width, height} = canvas;
    ctx.fillStyle = '#181819';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return await canvas.toBuffer('png');
}

module.exports = {
    createImage
}