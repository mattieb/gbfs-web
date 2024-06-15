# Notes

## File format

All numbers are little-endian unsigned ints.

The file is constructed by concatenating each of the following sections in sequence.

### Header

| Offset | Size | Value |
| ------ | ---- | ----- |
| 0      | 16   | `"PinEightGBFS\r\n\x1a\n"` |
| 16     | 4    | Total GBFS file size |
| 20     | 2    | Offset to start of directory (always 32) |
| 22     | 2    | Number of objects in GBFS file |
| 24     | 8    | Reserved |

### Directory entries

Repeats once for each object in the GBFS file.

| Offset | Size | Value |
| ------ | ---- | ----- |
| 0      | 24   | Object name (may not be null-terminated) |
| 24     | 4    | Size of object |
| 28     | 4    | File offset to start of object |

Extra padding may be observed at the end of the directory, but before the objects start. This may be the ["wasted space"](https://github.com/devkitPro/gba-tools/blob/054d507f90d32784274b6cf7e03f1c43d02d7a57/src/gbfs.c#L144) referred to in the original gbfs tool.

### Objects

Objects are concatenated directly to the GBFS file, one after another.

The original GBFS tool [pads each file to a 16-byte boundary](https://github.com/devkitPro/gba-tools/blob/054d507f90d32784274b6cf7e03f1c43d02d7a57/src/gbfs.c#L194). It does not seem this is necessary for [libgbfs](https://github.com/dmdemoura/libgbfs) to function correctly.

## File build dependencies

-   The [header](#header) needs to know the total GBFS file size.
    -   The header is always 32 bytes.
    -   The size of the [directory](#directory-entries) section must be 32 bytes times the number of objects in the GBFS file.
    -   The size of the [objects](#objects) section is the sum of all object sizes.
-   The [header](#header) needs to know the number of objects in the GBFS file.
    -   The number of [objects](#objects) should be determinable up front.
-   Each [directory entry](#directory-entries) needs to know the size of its object.
    -   The size of each [object](#objects) should be determinable up front.
-   Each [directory entry](#directory-entries) needs to know the offset to the start of its object.
    -   The [header](#header) knows the size of the [directory entries](#directory-entries) section. Objects start at 32 (the fixed size of the header) plus this.
    -   The size of any previous [object](#objects) is added to get the starting offset for the current entry's object.
