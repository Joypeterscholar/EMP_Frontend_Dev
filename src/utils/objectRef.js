// objectRef contract - see /docs/object-ref-contract.md.
// This must compute the exact same objectId as the backend's
// src/utils/object-ref.ts (buildObjectPath + computeObjectId) so a tag
// always lands on the correct machine, even when two machines share a name.

// Some exporters split one visual machine into several "_primitiveN" mesh
// nodes that are all children of a parent node representing the actual
// machine. Tag the parent so every primitive resolves to the same name.
export const resolveMachineNode = (mesh) => {
	if (/_primitive\d+$/i.test(mesh.name) && mesh.parent) {
		return mesh.parent;
	}
	return mesh;
};

const siblingsWithSameName = (node, scene) => {
	const siblings = node.parent
		? node.parent.getChildren()
		: scene?.rootNodes || [];
	return siblings.filter((sibling) => sibling.name === node.name);
};

// Walks up the mesh's parents to build a readable, unique path, e.g.
// "Building A/Room 1/Group#189[0]". A sibling index is appended whenever a
// node's name is shared by more than one sibling under the same parent -
// this is what tells two identically-named machines (or two instances of
// the same source mesh) apart.
export const buildObjectPath = (node, scene) => {
	const segments = [];
	let current = node;
	while (current) {
		const siblings = siblingsWithSameName(current, scene);
		segments.unshift(
			siblings.length > 1
				? `${current.name}[${siblings.indexOf(current)}]`
				: current.name
		);
		current = current.parent;
	}
	return segments.join("/");
};

// sha256(`${objectPath}::${pointCount}::${materialName}`), first 16 hex
// chars. Never derive this from mesh.uniqueId - Babylon regenerates that on
// every page load, so it would never match between sessions.
export const computeObjectId = async (objectPath, pointCount, materialName) => {
	const fingerprint = `${objectPath}::${pointCount}::${materialName || "none"}`;
	const data = new TextEncoder().encode(fingerprint);
	const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("")
		.slice(0, 16);
};

// Computes the full objectRef identity for a picked mesh: which node
// represents "the machine", its readable path, and its stable objectId.
export const getObjectRef = async (mesh, scene) => {
	const machineNode = resolveMachineNode(mesh);
	const objectPath = buildObjectPath(machineNode, scene);
	const pointCount =
		typeof machineNode.getTotalVertices === "function"
			? machineNode.getTotalVertices()
			: 0;
	const materialName = machineNode.material?.name || "none";
	const objectId = await computeObjectId(objectPath, pointCount, materialName);
	return { objectId, objectPath };
};
