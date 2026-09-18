// Throwaway proof for /docs/object-ref-contract.md: run this with
//   node scripts/verify-object-id.mjs
// It proves two things:
// 1. computeObjectId returns the exact same id for the same machine across
//    two *independent* calls - standing in for "before and after a full
//    page refresh", since nothing here is cached between the two calls.
// 2. The frontend calculates the exact same id as the backend for the same
//    inputs - "092022f163babaa9" is the value asserted for these same three
//    inputs by the backend's src/tests/object-ref.test.ts. If that test's
//    expected value ever changes, this constant must change with it.
import { buildObjectPath, computeObjectId } from "../src/utils/objectRef.js";

const EXPECTED_BACKEND_VALUE = "092022f163babaa9";

// A minimal stand-in for a Babylon mesh hierarchy: Building A > Room 1 > TROLLEY#1.
const buildingA = { name: "Building A", parent: null, getChildren: () => [] };
const room1 = { name: "Room 1", parent: buildingA, getChildren: () => [] };
buildingA.getChildren = () => [room1];
const trolley = { name: "TROLLEY#1", parent: room1, getChildren: () => [] };
room1.getChildren = () => [trolley];
const scene = { rootNodes: [buildingA] };

const path = buildObjectPath(trolley, scene);

const before = await computeObjectId(path, 2481, "TrolleyBodyMat");
const after = await computeObjectId(path, 2481, "TrolleyBodyMat");

if (before !== after) {
	console.error(`FAIL: objectId changed between calls (${before} vs ${after})`);
	process.exit(1);
}

if (before !== EXPECTED_BACKEND_VALUE) {
	console.error(
		`FAIL: frontend objectId (${before}) does not match the backend's value (${EXPECTED_BACKEND_VALUE})`
	);
	process.exit(1);
}

console.log(`OK: objectId is stable across refreshes and matches the backend -> ${before}`);
