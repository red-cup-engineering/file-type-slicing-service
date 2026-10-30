#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sliceFilesByType as slice } from "../src/slice-files-by-type.mjs";

function parseArgs(argv) {
  const args = { walk: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--walk") args.walk = argv[(index += 1)];
    else throw new Error(`unrecognized argument: ${arg}`);
  }
  return args;
}

async function readInput(walkPath, io) {
  if (walkPath) return readFile(walkPath, "utf8");
  let text = "";
  io.stdin.setEncoding("utf8");
  for await (const chunk of io.stdin) text += chunk;
  return text;
}

export function sliceFilesByType(input) {
  return slice(input);
}

export async function runSliceFilesByType(argv, io = process) {
  const args = parseArgs(argv);
  const raw = await readInput(args.walk, io);
  let walk;
  try {
    walk = JSON.parse(raw);
  } catch (error) {
    throw new Error(`input is not valid JSON: ${error.message}`);
  }
  if (walk?.type !== "PosixPathWalk" || !Array.isArray(walk.files)) {
    throw new Error('input is not a PosixPathWalk record (expected {"type":"PosixPathWalk","files":[...]})');
  }
  const result = sliceFilesByType({ files: walk.files });
  io.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return result;
}

if (resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1] ?? "")) {
  runSliceFilesByType(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`slice-files-by-type: ${error.message}\n`);
    process.exitCode = 64;
  });
}
