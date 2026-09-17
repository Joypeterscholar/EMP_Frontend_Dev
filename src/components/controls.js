import {
	Vector3,
	ActionManager,
	ExecuteCodeAction,
	PointerEventTypes,
} from "babylonjs";
import { simulateKeyDown } from "./ModelOnScreenControls";

export class JetBoxControls {
	constructor(scene) {
		this.scene = scene;
		this.camera = scene.activeCamera;
		this.jetBox = scene.getMeshByName("jetBox");
		this.position = Vector3.TransformCoordinates(
			scene.getMeshByName("jetBox").position,
			scene.getMeshByName("jetBox").computeWorldMatrix(true)
		);
		this.displacement = new Vector3(0, 0, 0);

		this.keys = {
			a: () => this.panLeft(),
			d: () => this.panRight(),
			q: () => this.panUp(),
			e: () => this.panDown(),
			w: () => this.panForward(),
			s: () => this.panBackward(),
			z: () => this.zoomIn(),
			x: () => this.zoomOut(),
			// 'ArrowUp': () => this.rotateUp(),
			// 'ArrowDown': () => this.rotateDown(),
			// 'ArrowLeft': () => this.rotateLeft(),
			// 'ArrowRight': () => this.rotateRight(),
		};

		this.setMouseEventsToControls();
		this.setupKeyboardObservables();
		this.setupOnScreenControls();
	}

	//   getCurrentDirection() {
	//     // Get the direction vector from the camera's position
	//     var ray = this.camera.getForwardRay();

	//     // Perform a ray cast to find the intersected mesh
	//     var pickInfo = this.scene.pickWithRay(ray);
	//     if (pickInfo.hit) {
	//         // Get the normal of the intersected surface
	//         var normal = pickInfo.getNormal();

	//         // Determine the direction based on the surface normal
	//         var directionText = "";

	//         if (Math.abs(normal.x) > Math.abs(normal.z)) {
	//             if (normal.x > 0) {
	//                 directionText = "E";
	//             } else {
	//                 directionText = "W";
	//             }
	//         } else {
	//             if (normal.z > 0) {
	//                 directionText = "S";
	//             } else {
	//                 directionText = "N";
	//             }
	//         }

	//         return directionText;
	//     } else {
	//         // No intersection found, return default direction
	//         return "N"; // You can choose a default direction if no intersection occurs
	//     }
	// }

	// getCurrentDirection() {
	//   // Get camera's rotation quaternion
	//   var rotationQuaternion = this.camera.absoluteRotationQuaternion;
	//   rotationQuaternion.normalize();

	//   // Get forward vector
	//   var forward = Vector3.Forward();
	//   forward = Vector3.TransformCoordinates(forward, rotationQuaternion);

	//   // Calculate angle between forward vector and north direction
	//   var angle = Math.atan2(forward.x, forward.z);
	//   angle = angle * (180 / Math.PI); // Convert radians to degrees
	//   var direction = "N";

	//   // Determine cardinal direction
	//   if (angle >= -45 && angle < 45) direction = "N";
	//   else if (angle >= 45 && angle < 135) direction = "E";
	//   else if (angle >= -135 && angle < -45) direction = "W";
	//   else direction = "S";

	//   return direction;
	// }

	getCurrentDirection() {
		if (!this.jetBox || !this.camera) {
			console.error("Parent mesh or camera not found in the scene.");
			return null;
		}

		// Get parent mesh's world matrix
		var parentWorldMatrix = this.jetBox.getWorldMatrix();

		// Get camera's local matrix
		var cameraLocalMatrix = this.camera
			.getWorldMatrix()
			.multiply(parentWorldMatrix.invert());

		// Extract forward direction from camera's local matrix
		var direction = new Vector3(
			cameraLocalMatrix.m[8],
			cameraLocalMatrix.m[9],
			cameraLocalMatrix.m[10]
		);

		// Normalize direction vector
		direction.normalize();

		// Determine the direction based on the vector components
		var directionText = "";

		// Determine the primary direction (north, south, east, west)
		if (Math.abs(direction.x) > Math.abs(direction.z)) {
			if (direction.x > 0) {
				directionText = "S";
			} else {
				directionText = "N";
			}
		} else {
			if (direction.z > 0) {
				directionText = "E";
			} else {
				directionText = "W";
			}
		}

		return directionText;
	}

	// getCurrentDirection() {

	//    if (!this.jetBox || !this.camera) {
	//       console.error("Parent mesh or camera not found in the scene.");
	//       return null;
	//   }

	//   // Get parent mesh's world matrix
	//   var parentWorldMatrix = this.jetBox.getWorldMatrix();

	//   // Get camera's local matrix
	//   var cameraLocalMatrix = this.camera.getWorldMatrix().multiply(parentWorldMatrix.invert());

	//   // Extract forward direction from camera's local matrix
	//   var direction = new Vector3(cameraLocalMatrix.m[8], cameraLocalMatrix.m[9], cameraLocalMatrix.m[10]);

	//   // Normalize direction vector
	//   direction.normalize();

	//   // Determine the primary direction (north, south, east, west)
	//   var primaryDirection = "";
	//   if (Math.abs(direction.z) > Math.abs(direction.x)) {
	//       if (direction.z > 0) {
	//           primaryDirection = "N";
	//       } else {
	//           primaryDirection = "S";
	//       }
	//   } else {
	//       if (direction.x > 0) {
	//           primaryDirection = "E";
	//       } else {
	//           primaryDirection = "W";
	//       }
	//   }

	//   // Determine the secondary direction (northeast, northwest, southeast, southwest)
	//   var secondaryDirection = "";
	//   if (Math.abs(direction.z) > Math.abs(direction.x)) {
	//       if (direction.x > 0) {
	//           secondaryDirection = "E";
	//       } else {
	//           secondaryDirection = "W";
	//       }
	//   } else {
	//       if (direction.z > 0) {
	//           secondaryDirection = "N";
	//       } else {
	//           secondaryDirection = "S";
	//       }
	//   }

	//   // Combine primary and secondary directions
	//   var finalDirection = primaryDirection;
	//   if (secondaryDirection !== "") {
	//       finalDirection += "" + secondaryDirection;
	//   }

	//   return finalDirection;
	// }

	setMouseEventsToControls() {
		this.scene.onPointerObservable.add((pointerInfo) => {
			switch (pointerInfo.type) {
				case PointerEventTypes.POINTERWHEEL:
					if (pointerInfo.event.deltaY < 0) {
						simulateKeyDown("ArrowUp", "ArrowUp", 38);
					} else {
						simulateKeyDown("ArrowDown", "ArrowDown", 40);
					}
					break;
			}
		});
	}

	setupActionManager() {
		// Register actions for pointer events using ActionManager
		this.jetBox.actionManager = new ActionManager(this.scene);

		// Example: Trigger action on key down
		this.jetBox.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
				const key = evt.sourceEvent.key.toLowerCase();
				this.handleKeyPress(key);
			})
		);
	}

	setupKeyboardObservables() {
		this.scene.onKeyboardObservable.add((kbInfo) => {
			const key = kbInfo.event.key.toLowerCase();
			this.handleKeyPress(key);
		});
	}

	setupOnScreenControls() {
		const intervals = {};

		function startAction(buttonId, action, intervalDuration = 100) {
			action;
			intervals[buttonId] = setInterval(action, intervalDuration);
		}

		function stopAction(buttonId) {
			clearInterval(intervals[buttonId]);
			delete intervals[buttonId];
		}

		function attachListeners(buttonId, action) {
			const button = document.getElementById(buttonId);
			button.addEventListener("pointerdown", () =>
				startAction(buttonId, action)
			);
			button.addEventListener("pointerup", () => stopAction(buttonId));
		}

		// Attach event listeners for each button and its corresponding action
		attachListeners("panLeft", () => this.panLeft());
		attachListeners("panRight", () => this.panRight());
		attachListeners("panUp", () => this.panUp());
		attachListeners("panDown", () => this.panDown());
		attachListeners("panForward", () => this.panForward());
		attachListeners("panBackward", () => this.panBackward());
		attachListeners("zoomIn", () => this.zoomIn());
		attachListeners("zoomOut", () => this.zoomOut());
		attachListeners("rotateLeft", () => this.rotateLeft());
		attachListeners("rotateRight", () => this.rotateRight());
		attachListeners("rotateUp", () => this.rotateUp());
		attachListeners("rotateDown", () => this.rotateDown());
	}

	handleKeyPress(key) {
		const handler = this.keys[key];
		if (handler) {
			handler();
		}
	}

	panLeft() {
		const direction = this.getCurrentDirection();
		switch (direction) {
			case "N":
				this.updateDisplacement(0, 0, -0.15);
				break;
			case "NE":
				this.updateDisplacement(-0.05, 0, -0.05);
				break;
			case "E":
				this.updateDisplacement(-0.15, 0, 0);
				break;
			case "SE":
				this.updateDisplacement(-0.05, 0, 0.05);
				break;
			case "S":
				this.updateDisplacement(0, 0, 0.15);
				break;
			case "SW":
				this.updateDisplacement(0.05, 0, 0.05);
				break;
			case "W":
				this.updateDisplacement(0.15, 0, 0);
				break;
			case "NW":
				this.updateDisplacement(0.05, 0, -0.05);
				break;
			default:
				break;
		}
	}

	panRight() {
		const direction = this.getCurrentDirection();
		switch (direction) {
			case "N":
				this.updateDisplacement(0, 0, 0.15);
				break;
			case "NE":
				this.updateDisplacement(0.05, 0, 0.05);
				break;
			case "E":
				this.updateDisplacement(0.15, 0, 0);
				break;
			case "SE":
				this.updateDisplacement(0.05, 0, -0.05);
				break;
			case "S":
				this.updateDisplacement(0, 0, -0.15);
				break;
			case "SW":
				this.updateDisplacement(-0.05, 0, -0.05);
				break;
			case "W":
				this.updateDisplacement(-0.15, 0, 0);
				break;
			case "NW":
				this.updateDisplacement(-0.05, 0, 0.05);
				break;
			default:
				break;
		}
	}

	panUp() {
		const direction = this.getCurrentDirection();
		switch (direction) {
			case "N":
				this.updateDisplacement(0, 0.15, 0);
				break;
			case "NE":
				this.updateDisplacement(0, -0.05, -0.05);
				break;
			case "E":
				this.updateDisplacement(0, 0.15, 0);
				break;
			case "SE":
				this.updateDisplacement(0, 0.05, -0.05);
				break;
			case "S":
				this.updateDisplacement(0, 0.15, 0);
				break;
			case "SW":
				this.updateDisplacement(0, 0.05, 0.05);
				break;
			case "W":
				this.updateDisplacement(0, 0.15, 0);
				break;
			case "NW":
				this.updateDisplacement(0, -0.05, 0.05);
				break;
			default:
				break;
		}
	}

	panDown() {
		const direction = this.getCurrentDirection();
		switch (direction) {
			case "N":
				this.updateDisplacement(0, -0.15, 0);
				break;
			case "NE":
				this.updateDisplacement(0, 0.05, 0.05);
				break;
			case "E":
				this.updateDisplacement(0, -0.15, 0);
				break;
			case "SE":
				this.updateDisplacement(0, -0.05, 0.05);
				break;
			case "S":
				this.updateDisplacement(0, -0.15, 0);
				break;
			case "SW":
				this.updateDisplacement(0, -0.05, -0.05);
				break;
			case "W":
				this.updateDisplacement(0, -0.15, 0);
				break;
			case "NW":
				this.updateDisplacement(0, 0.05, -0.05);
				break;
			default:
				break;
		}
	}

	panForward() {
		const direction = this.getCurrentDirection();
		switch (direction) {
			case "N":
				this.updateDisplacement(-0.15, 0, 0);
				break;
			case "NE":
				this.updateDisplacement(-0.05, 0, 0.05);
				break;
			case "E":
				this.updateDisplacement(0, 0, 0.15);
				break;
			case "SE":
				this.updateDisplacement(0.05, 0, 0.05);
				break;
			case "S":
				this.updateDisplacement(0.15, 0, 0);
				break;
			case "SW":
				this.updateDisplacement(0.05, 0, -0.05);
				break;
			case "W":
				this.updateDisplacement(0, 0, -0.15);
				break;
			case "NW":
				this.updateDisplacement(-0.05, 0, -0.05);
				break;
			default:
				break;
		}
	}

	panBackward() {
		const direction = this.getCurrentDirection();
		switch (direction) {
			case "N":
				this.updateDisplacement(0.15, 0, 0);
				break;
			case "NE":
				this.updateDisplacement(0.05, 0, -0.05);
				break;
			case "E":
				this.updateDisplacement(0, 0, -0.15);
				break;
			case "SE":
				this.updateDisplacement(-0.05, 0, -0.05);
				break;
			case "S":
				this.updateDisplacement(-0.15, 0, 0);
				break;
			case "SW":
				this.updateDisplacement(-0.05, 0, 0.05);
				break;
			case "W":
				this.updateDisplacement(0, 0, 0.15);
				break;
			case "NW":
				this.updateDisplacement(0.05, 0, 0.05);
				break;
			default:
				break;
		}
	}

	zoomIn() {
		this.scene.activeCamera.radius -= 0.3;
	}

	zoomOut() {
		this.scene.activeCamera.radius += 0.3;
	}

	rotateLeft() {
		this.updateRotation(0, -0.15, 0);
	}

	rotateRight() {
		this.updateRotation(0, 0.15, 0);
	}

	rotateUp() {
		this.updateRotation(-0.15, 0, 0);
	}

	rotateDown() {
		this.updateRotation(0.15, 0, 0);
	}

	updateDisplacement(x, y, z) {
		this.camera.position.x += x;
		this.camera.position.y += y;
		this.camera.position.z += z;
	}

	updateRotation(x, y, z) {
		this.jetBox.rotation.x += x;
		this.jetBox.rotation.y += y;
		this.jetBox.rotation.z += z;
	}
}

export default function BabylonControls(scene) {
	new JetBoxControls(scene);
}
