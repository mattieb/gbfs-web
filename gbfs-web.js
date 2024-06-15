/*
 * This file is part of gbfs-web <https://mattiebee.dev/gbfs-web>.
 *
 * Copyright 2024 Mattie Behrens.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * “Software”), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject
 * to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR
 * ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

function buildHeader(structure) {
  const buffer = new ArrayBuffer(32);

  const chars = new Uint8Array(buffer);
  const magic = "PinEightGBFS\r\n\x1a\n";
  for (let i = 0; i < magic.length; i++) {
    chars[i] = magic.charCodeAt(i);
  }

  const view = new DataView(buffer, 16);
  view.setUint32(0, structure.totalSize, true);
  view.setUint16(4, 32, true);
  view.setUint16(6, structure.objects.length, true);

  return buffer;
}

function buildDirectory(structure) {
  const buffers = [];

  for (const object of structure.objects) {
    const buffer = new ArrayBuffer(32);

    const chars = new Uint8Array(buffer);
    const truncatedName = object.name.slice(0, 24);
    for (let i = 0; i < truncatedName.length; i++) {
      chars[i] = truncatedName.charCodeAt(i);
    }

    const view = new DataView(buffer, 24);
    view.setUint32(0, object.size, true);
    view.setUint32(4, object.offset, true);

    buffers.push(buffer);
  }

  return buffers;
}

const HEADER_SIZE = 32;
const DIRECTORY_ENTRY_SIZE = 32;

function objectSize(file) {
  // return Math.ceil(file.size / 16) * 16; // padded
  return file.size;
}

async function calculateStructure(files) {
  const directory = {
    offset: HEADER_SIZE,
    size: DIRECTORY_ENTRY_SIZE * files.length,
  };

  let totalSize = directory.offset + directory.size;
  const objectPromises = [...files].map(async (file) => {
    const object = {
      buffer: await file.arrayBuffer(),
      name: file.name,
      offset: totalSize,
      size: file.size,
    };
    totalSize += object.size;
    return object;
  });
  const objects = await Promise.all(objectPromises);
  objects.sort((a, b) => 
    a.name < b.name ? -1 :
    a.name > b.name ? 1 :
    0);

  return { directory, objects, totalSize };
}

async function save() {
  const objectPicker = document.getElementById("objects");
  const gbfsStructure = await calculateStructure(objectPicker.files);

  const headerBuffer = buildHeader(gbfsStructure);
  const directoryBuffers = buildDirectory(gbfsStructure);

  const romPicker = document.getElementById("rom");
  const romBuffer = await romPicker.files[0].arrayBuffer();

  const buffers = [
    romBuffer,
    headerBuffer,
    ...directoryBuffers,
    ...gbfsStructure.objects.map((object) => object.buffer),
  ];

  const blob = new Blob(buffers, { mimeType: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.setAttribute("href", url);
  anchor.setAttribute("download", romPicker.files[0].name);
  anchor.click();
}

async function main() {
  const saveButton = document.getElementById("save");
  saveButton.onclick = async () => {
    await save();
  };
}

document.onreadystatechange = () => {
  if (document.readyState === "interactive") {
    main();
  }
};
