// Throwaway proof for /docs/object-ref-contract.md: run this with
//   node scripts/verify-object-id.mjs
// It proves:
// 1. computeObjectId returns the exact same id for the same machine across
//    two *independent* calls - standing in for "before and after a full
//    page refresh", since nothing here is cached between the two calls.
// 2. The frontend calculates the exact same id as the backend for the same
//    inputs - "092022f163babaa9" is the value asserted for these same three
//    inputs by the backend's src/tests/object-ref.test.ts. If that test's
//    expected value ever changes, this constant must change with it.
// 3. Two primitives of the same machine (T0.1 worked example 2) resolve to
//    their shared parent and so get the *same* objectId.
// 4. Two InstancedMesh copies of the same source mesh in different rooms
//    (T0.1 worked example 3) get *different* objectIds, and two instances
//    that land in the same room with the same name are disambiguated by
//    sibling index.
import {
	buildObjectPath,
	computeObjectId,
	getObjectRef,
} from "../src/utils/objectRef.js";

const EXPECTED_BACKEND_VALUE = "092022f163babaa9";

let failed = false;
const check = (label, condition) => {
	if (!condition) {
		console.error(`FAIL: ${label}`);
		failed = true;
	}
};

// --- Scenario 1: stability + backend parity ------------------------------

// A minimal stand-in for a Babylon mesh hierarchy: Building A > Room 1 > TROLLEY#1.
const buildingA = { name: "Building A", parent: null, getChildren: () => [] };
const room1 = { name: "Room 1", parent: buildingA, getChildren: () => [] };
const trolley = { name: "TROLLEY#1", parent: room1, getChildren: () => [] };
room1.getChildren = () => [trolley];
buildingA.getChildren = () => [room1];
const scene1 = { rootNodes: [buildingA] };

const path = buildObjectPath(trolley, scene1);
const before = await computeObjectId(path, 2481, "TrolleyBodyMat");
const after = await computeObjectId(path, 2481, "TrolleyBodyMat");

check(`objectId is stable across calls (${before} vs ${after})`, before === after);
check(
	`frontend objectId (${before}) matches the backend's value (${EXPECTED_BACKEND_VALUE})`,
	before === EXPECTED_BACKEND_VALUE
);

// --- Scenario 2: primitives resolve to their shared parent ---------------

// Building A/Room 1/WasteBin[0] split into two primitives - clicking either
// one should tag "the machine" (the parent), not the individual primitive.
const wasteBin = {
	name: "WasteBin",
	parent: room1,
	material: { name: "BinMat" },
	getTotalVertices: () => 900,
	getChildren: () => [],
};
const otherWasteBin = { name: "WasteBin", parent: room1, getChildren: () => [] };
room1.getChildren = () => [trolley, wasteBin, otherWasteBin];
wasteBin.getChildren = () => [primitive0, primitive1];

const primitive0 = {
	name: "WasteBin_primitive0",
	parent: wasteBin,
	material: { name: "BinMat" },
	getTotalVertices: () => 500,
};
const primitive1 = {
	name: "WasteBin_primitive1",
	parent: wasteBin,
	material: { name: "BinMat" },
	getTotalVertices: () => 400,
};

const ref0 = await getObjectRef(primitive0, scene1);
const ref1 = await getObjectRef(primitive1, scene1);

check(
	`both primitives resolve to the parent's path (got "${ref0.objectPath}" and "${ref1.objectPath}")`,
	ref0.objectPath === "Building A/Room 1/WasteBin[0]" && ref1.objectPath === ref0.objectPath
);
check(
	`both primitives of the same machine get the same objectId (${ref0.objectId} vs ${ref1.objectId})`,
	ref0.objectId === ref1.objectId
);

// --- Scenario 3: InstancedMesh copies are told apart by path, not identity ---

// Two InstancedMesh nodes sharing one source mesh's geometry/material via
// Babylon's real delegation (InstancedMesh#material / #getTotalVertices
// both read from .sourceMesh) - see the comment on resolveMachineNode in
// objectRef.js for why this needs no special-casing.
const sourceMesh = { name: "SourceGroup189", material: { name: "ConveyorMat" } };
sourceMesh.getTotalVertices = () => 1200;

const makeInstance = (name, parent) => ({
	name,
	parent,
	get material() {
		return sourceMesh.material;
	},
	getTotalVertices: () => sourceMesh.getTotalVertices(),
	getChildren: () => [],
});

const room2 = { name: "Room 2", parent: buildingA, getChildren: () => [] };
const room3 = { name: "Room 3", parent: buildingA, getChildren: () => [] };
buildingA.getChildren = () => [room1, room2, room3];

const instanceInRoom2 = makeInstance("Group#189", room2);
room2.getChildren = () => [instanceInRoom2];
const instanceInRoom3 = makeInstance("Group#189", room3);
room3.getChildren = () => [instanceInRoom3];

const refRoom2 = await getObjectRef(instanceInRoom2, scene1);
const refRoom3 = await getObjectRef(instanceInRoom3, scene1);

check(
	`same-named instances in different rooms get different objectPaths ("${refRoom2.objectPath}" vs "${refRoom3.objectPath}")`,
	refRoom2.objectPath !== refRoom3.objectPath
);
check(
	`same-named instances in different rooms get different objectIds despite identical geometry/material (${refRoom2.objectId} vs ${refRoom3.objectId})`,
	refRoom2.objectId !== refRoom3.objectId
);
check(
	`the same instance resolves to the same objectId on a second call (refreshing the page)`,
	(await getObjectRef(instanceInRoom2, scene1)).objectId === refRoom2.objectId
);

// Two instances landing as siblings in the *same* room, same name - must be
// told apart by sibling index (T0.1 worked example 3).
const instanceA = makeInstance("Group#189", room2);
const instanceB = makeInstance("Group#189", room2);
room2.getChildren = () => [instanceInRoom2, instanceA, instanceB];

const refA = await getObjectRef(instanceA, scene1);
const refB = await getObjectRef(instanceB, scene1);

check(
	`sibling instances with the same name get index-suffixed, distinct objectPaths ("${refA.objectPath}" vs "${refB.objectPath}")`,
	refA.objectPath !== refB.objectPath && refA.objectId !== refB.objectId
);

if (failed) {
	process.exit(1);
}

console.log(`OK: objectId is stable across refreshes and matches the backend -> ${before}`);
console.log(`OK: primitives of the same machine collapse to one objectId -> ${ref0.objectId}`);
console.log(
	`OK: instances are told apart by objectPath, not by their shared source mesh -> ${refRoom2.objectId} vs ${refRoom3.objectId}`
);
