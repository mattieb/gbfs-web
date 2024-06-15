# gbfs-web

gbfs-web was developed for and tested with [4-e](http://mattiebee.dev/4-e),
a Game Boy Advance homebrew application that can emulate an e-Reader
for Super Mario Advance 4.

By following the simple steps in the app, you can take any ROM that
supports [GBFS](http://pineight.com/gba/#gbfs), select files to
attach, and save a new ROM with those files attached.

Everything is done locally in your browser. No ROM or file data is
sent to or received from any server.

## Usage

Go to https://mattiebee.app/gbfs-web.

Or, open index.html directly.

## Differences

One key difference between GBFS files made by gbfs-web and [the
original gbfs
tool](https://github.com/devkitPro/gba-tools/blob/054d507f90d32784274b6cf7e03f1c43d02d7a57/src/gbfs.c)
is that gbfs-web does not bother to pad the objects in the GBFS
file. I did not see a use for it, and 4-e (which uses
[libgbfs](https://github.com/dmdemoura/libgbfs/blob/4230f4b6221af557210393c84bbc1494e1e4bcb0/source/libgbfs.c))
does not appear to have any issues with it, even when loaded with
lots of files.

gbfs-web does not currently pad the base ROM. The original tool
doesn't either, but the original distribution did include a tool
called
[padbin](https://github.com/devkitPro/general-tools/blob/46086605cdc63fb02ba0ed08cdc00801ba00c6f0/padbin.c)
which does do this. 4-e's build process includes a step to pad to
256 bytes, libgbfs' default stride, so it did not seem necessary
here, but it could be added.

If folks encounter issues due to these differences, gbfs-web can
be changed accordingly. Please check to see if using the original
tools solves the issue before filing bugs or submitting changes.

## Thanks

gbfs-web wouldn't exist without:

- [GBFS](http://pineight.com/gba/#gbfs) (obviously!)

- [Simple.css](https://simplecss.org)
