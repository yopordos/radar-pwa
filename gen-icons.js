const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

function crc32(buf) {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = t[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ -1) >>> 0;
}

function pngChunk(type, data) {
  const tb = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crcVal = Buffer.alloc(4); crcVal.writeUInt32BE(crc32(Buffer.concat([tb, data])));
  return Buffer.concat([len, tb, data, crcVal]);
}

function hex(h) {
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
}

function generatePNG(size, outPath) {
  const bg = hex('#0c0c0c');
  const fg = hex('#e8ff47');
  const cx = size / 2, r = size * 0.44;
  const rowBytes = size * 3;
  const raw = Buffer.alloc(size * (rowBytes + 1));

  for (let y = 0; y < size; y++) {
    raw[y * (rowBytes + 1)] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cx;
      const px = (dx*dx + dy*dy <= r*r) ? fg : bg;
      const off = y * (rowBytes + 1) + 1 + x * 3;
      raw[off] = px[0]; raw[off+1] = px[1]; raw[off+2] = px[2];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  const png = Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);

  fs.writeFileSync(outPath, png);
  console.log('Generated:', outPath);
}

const dir = path.join(__dirname);
generatePNG(192, path.join(dir, 'icon-192.png'));
generatePNG(512, path.join(dir, 'icon-512.png'));
fs.copyFileSync(path.join(dir, 'icon-192.png'), path.join(dir, 'icon.png'));
console.log('Icons ready.');
