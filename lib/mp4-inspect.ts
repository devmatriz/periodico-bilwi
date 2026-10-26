import "server-only";

import { open } from "node:fs/promises";

export type Mp4Info = {
  durationSeconds: number;
  codec: "h264" | "hevc" | "otro";
};

const MAX_MOOV_BYTES = 32 * 1024 * 1024;

/**
 * Lee la duración (caja mvhd) y el códec (avc1 / hvc1) de un MP4 o MOV sin herramientas externas.
 * Recorre las cajas de primer nivel porque los teléfonos suelen escribir "moov" al final del archivo.
 */
export async function inspectMp4(filePath: string): Promise<Mp4Info | null> {
  const handle = await open(filePath, "r");
  try {
    const { size } = await handle.stat();
    const header = Buffer.alloc(16);
    let offset = 0;
    let sawFtyp = false;

    while (offset + 8 <= size) {
      await handle.read(header, 0, 16, offset);
      let boxSize = header.readUInt32BE(0);
      const type = header.toString("latin1", 4, 8);
      let headerSize = 8;

      if (boxSize === 1) {
        boxSize = Number(header.readBigUInt64BE(8));
        headerSize = 16;
      } else if (boxSize === 0) {
        boxSize = size - offset;
      }

      if (boxSize < headerSize) return null;
      if (type === "ftyp") sawFtyp = true;

      if (type === "moov") {
        if (!sawFtyp || boxSize > MAX_MOOV_BYTES) return null;
        const moov = Buffer.alloc(boxSize - headerSize);
        await handle.read(moov, 0, moov.length, offset + headerSize);
        return readMoov(moov);
      }

      offset += boxSize;
    }

    return null;
  } finally {
    await handle.close();
  }
}

function readMoov(moov: Buffer): Mp4Info | null {
  const mvhd = moov.indexOf("mvhd", 0, "latin1");
  if (mvhd < 4) return null;

  const body = mvhd + 4;
  const version = moov.readUInt8(body);
  let timescale: number;
  let duration: number;

  if (version === 1) {
    timescale = moov.readUInt32BE(body + 20);
    duration = Number(moov.readBigUInt64BE(body + 24));
  } else {
    timescale = moov.readUInt32BE(body + 12);
    duration = moov.readUInt32BE(body + 16);
  }

  if (!timescale) return null;

  const codec = moov.includes("hvc1", 0, "latin1") || moov.includes("hev1", 0, "latin1")
    ? "hevc"
    : moov.includes("avc1", 0, "latin1") || moov.includes("avc3", 0, "latin1")
      ? "h264"
      : "otro";

  return { durationSeconds: duration / timescale, codec };
}
