import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const PRISMA_CLIENT_PACKAGE_JSON = '@prisma/client/package.json';

// pnpm may not create node_modules/.prisma automatically when build scripts are restricted.
// Prisma's type declarations reference ".prisma/client/default", which requires this folder to be resolvable.
function isNodeErrorWithCode(error, code) {
  return (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && error.code === code
  );
}

function resolvePrismaClientPackageJsonPath(workingDirectory) {
  try {
    return require.resolve(PRISMA_CLIENT_PACKAGE_JSON, { paths: [workingDirectory] });
  } catch (error) {
    if (isNodeErrorWithCode(error, 'MODULE_NOT_FOUND')) {
      return null;
    }

    throw error;
  }
}

function resolvePrismaTargetPath(prismaClientPackageJsonPath) {
  const prismaClientDirectoryPath = path.dirname(prismaClientPackageJsonPath);
  return path.resolve(prismaClientDirectoryPath, '..', '..', '.prisma');
}

function hasExistingEntryAtPath(filePath) {
  try {
    fs.lstatSync(filePath);
    return true;
  } catch (error) {
    if (isNodeErrorWithCode(error, 'ENOENT')) {
      return false;
    }

    throw error;
  }
}

function ensurePrismaSymlink() {
  const workingDirectory = process.cwd();
  const prismaSymlinkPath = path.join(workingDirectory, 'node_modules', '.prisma');
  const prismaClientPackageJsonPath = resolvePrismaClientPackageJsonPath(workingDirectory);

  if (!prismaClientPackageJsonPath) {
    return;
  }

  const prismaTargetPath = resolvePrismaTargetPath(prismaClientPackageJsonPath);
  if (!fs.existsSync(prismaTargetPath)) {
    return;
  }

  if (hasExistingEntryAtPath(prismaSymlinkPath)) {
    return;
  }

  fs.mkdirSync(path.dirname(prismaSymlinkPath), { recursive: true });
  fs.symlinkSync(prismaTargetPath, prismaSymlinkPath, 'dir');
}

ensurePrismaSymlink();
