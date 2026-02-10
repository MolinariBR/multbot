import fs from 'node:fs';
import path from 'node:path';

// pnpm may not create node_modules/.prisma automatically when build scripts are restricted.
// Prisma's type declarations reference ".prisma/client/default", which requires this folder to be resolvable.
function ensureSymlink() {
  const cwd = process.cwd();
  const linkPath = path.join(cwd, 'node_modules', '.prisma');

  let prismaClientPkgJson;
  try {
    prismaClientPkgJson = require.resolve('@prisma/client/package.json', { paths: [cwd] });
  } catch (err) {
    // If @prisma/client is not installed yet, do nothing.
    return;
  }

  const prismaClientDir = path.dirname(prismaClientPkgJson); // .../node_modules/@prisma/client
  const target = path.resolve(prismaClientDir, '..', '..', '.prisma'); // .../node_modules/.prisma

  if (!fs.existsSync(target)) {
    return;
  }

  try {
    const stat = fs.lstatSync(linkPath);
    if (stat.isSymbolicLink()) return;
    // If it's a real dir/file, don't overwrite it.
    return;
  } catch {
    // doesn't exist
  }

  fs.mkdirSync(path.dirname(linkPath), { recursive: true });
  fs.symlinkSync(target, linkPath, 'dir');
}

ensureSymlink();

