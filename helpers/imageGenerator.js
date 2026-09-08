const { Canvas, loadImage, FontLibrary} = require('skia-canvas')

async function createImage(avatarUrl, name){
    let canvas = new Canvas(500, 200),
        ctx = canvas.getContext("2d"),
        {width, height} = canvas;
    const avatar = await loadImage(avatarUrl);
    const avatarSize = 126;
    const avatarRadius = avatarSize / 2;
    const padding = (height - avatarSize) / 2;

    // bg, later customizable
    ctx.fillStyle = '#181819';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const textX= padding + avatarSize + 15;
    const textY = padding + 28;

    // NAME texty shmexty fitting shenanigans
    let nameFontSize = 28;

    ctx.font = `900 ${nameFontSize}px "Segoe UI"`;
    while (ctx.measureText(name).width > canvas.width - (padding * 2 + avatarSize)){
        ctx.font = `900 ${nameFontSize -= 10}px "Segoe UI"`;
    }

    // NAME texty shmexty
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, textX, textY);

    // STATS texty shmexty
    ctx.font = '16px Poppins';
    ctx.fillStyle = '#C6C6C6';

    const statStrings = ['avg guesses:', 'streak:', 'max streak:'];
    const textYOffsets = [textY + 35, textY + 35 + 25, textY + 35 + 25 * 2];

    for (let i = 0; i < 3; i++){
        ctx.fillText(statStrings[i], textX, textYOffsets[i]);
    }

    // VALUES texty shmexty
    const stringWidths = statStrings.map((item) => ctx.measureText(item).width);
    const colors = ['#FC84FF', '#FFD161', '#75CCFF'];

    ctx.font = '900 16px "Segoe UI"';
    for (let i = 0; i < 3; i++){
        ctx.fillStyle = colors[i];
        ctx.fillText('0', textX + stringWidths[i] + 5, textYOffsets[i]);
    }

    // avatar
    ctx.beginPath();
    ctx.arc(padding + avatarRadius, padding + avatarRadius, avatarRadius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, padding, padding, avatarSize, avatarSize);

    return await canvas.toBuffer('image/png');
}

module.exports = {
    createImage
}