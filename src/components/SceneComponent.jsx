/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import {
	Color3,
	VideoRecorder,
	// Quaternion,
	Tools,
	Engine,
	// Matrix,
	MeshBuilder,
	Camera,
	// hack
	FreeCamera,
	HemisphericLight,
	StandardMaterial,
	Vector3,
	Scene,
	ActionManager,
	ExecuteCodeAction,
	VertexData,
	Mesh,
	InstancedMesh,
} from "@babylonjs/core";
import { SceneLoader } from "babylonjs";
import "babylonjs-loaders";
import * as GUI from "babylonjs-gui";
import { toast } from "react-toastify";
import BabylonControls from "./controls";
import { useDispatch, useSelector } from "react-redux";
import { dispatchSelectedMesh } from "../redux/actions/meshActions";
import { useControls, Leva } from "leva";
import { memoize } from "proxy-memoize";
import { customFetch, formatDate, formatTime, getRealFileUrl } from "../utils";
import { useLocation } from "react-router-dom";
import { getUserFromLocalStorage } from "@/redux/reducers/userReducer";

let currTagPos = null;
let currSpotlight = null;
let currCameraPosition = null;
let currCameraDirection = null;
let currentCameraRotation = null;
let saveCameraPositionAndDirection = {
	position: null,
	direction: null,
	rotation: null,
	inSunView: false,
};

let discs = [];
let discsClone = []; // used to reposition tags in 2d view

// very very wrong but it is already what it is so live with it until a full rewrite
let modelId = "";
let setTagsDataGlobal = null;

let globalTagDescs = [];

const cameraControls = {
	cameraSensitivity: { value: 1, min: 0, max: 10, step: 1 },
	// cameraSpeed: { value: 3, min: 0, max: 10, step:1 },
	zoomSensitivity: { value: 1, min: 0, max: 50, step: 1 },
	panSensitivity: { value: 1, min: 0, max: 10, step: 1 },
	angularSensibility: { value: 1000, min: 0, max: 5000, step: 500 },
	contrast: { value: 1, min: 0, max: 0.7, step: 0.1 },
	// zoomInertia: { value: 0.9, min: 0, max: 1, step:0.1 },
	// panInertia: { value: 0.9, min: 0, max: 1, step:0.1 },
	apply: true,
};

export function SceneComponent({
	baseUrl,
	filenameWithExtension,
	setIsLoading,
	tags,
	setTagsData,
	onSceneReady,
	model,
	...rest
}) {
	const reactCanvas = useRef(null);
	const dispatch = useDispatch();
	const controls = useControls(cameraControls);
	const setting = useSelector((state) => state.settingState.setting);
	const [newTaggedInfoName, setNewTaggedInfoName] = useState("");
	const [newTaggedInfoPosition, setNewTaggedInfoPosition] = useState("");
	const [newTaggedInfo, setNewTaggedInfo] = useState({});
	modelId = model._id;
	setTagsDataGlobal = setTagsData;
	// const modelInteractionData = useSelector(
	//   memoize((state) => state.selectedMeshState.data)
	// );

	const modelInterationActiveData = useSelector(
		memoize((state) => state.selectedMeshState.activeMeshData)
	);

	const destructureTaggedInfo = (modelInterationData) => {
		if (modelInterationData) {
			const newTaggedinfo = JSON.parse(modelInterationData);
			return [newTaggedinfo?.meshName, newTaggedinfo?.tagPosition];
		} else {
			return [];
		}
	};

	function delayCreateScene(engine, baseUrl, filenameWithExtension) {
		const scene = new Scene(engine);
		if (window.scene) {
			// navigating back after having created scene therefore reload
			// page to prevent weird screen bug
			window.scene = undefined;
			window.location.reload();
		}
		window.scene = scene; // make global
		const canvas = document.getElementById("renderCanvas");

		const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
		light.intensity = controls.contrast;

		// this also saves the loaded file in indexedDb
		loadSceneFromGlb(getRealFileUrl(model.file), scene, model).then(() => {
			setIsLoading(false);
			toast.success("Facility Section is ready!");
			setupVideoRecording(scene);
		});

		let is2DView;

		const handleHeatMapClick = (e) => {
			e.preventDefault();
			e.stopPropagation();
			let camera1 = scene.getCameraByName("camera1");
			if (saveCameraPositionAndDirection.inSunView) {
				returnToNormalView();
				reactCanvas.current?.focus();
			} else {
				saveCameraPositionAndDirection.inSunView = true;
				saveCameraPositionAndDirection.position = camera1.position.clone();
				saveCameraPositionAndDirection.direction = camera1
					.getForwardRay()
					.direction.clone();
				saveCameraPositionAndDirection.rotation = new Vector3(
					camera1.rotation.x,
					camera1.rotation.y,
					camera1.rotation.z
				);
				centerCameras(scene, true);
				displayTagsClonesHighUp();
				setArrowGuideVisibility(scene, false);
				reactCanvas.current?.focus();
			}
		};

		const handle2dBtnClick = (e) => {
			let twoDimageUrl = model.twoD || "";
			displayImage(getRealFileUrl(twoDimageUrl));
		};

		const heatmapButton = document.getElementById("heatmapButton");
		heatmapButton.removeEventListener("click", handleHeatMapClick);
		heatmapButton.addEventListener("click", handleHeatMapClick);

		const twoDviewBtn = document.getElementById("twoDview");
		twoDviewBtn.removeEventListener("click", handle2dBtnClick);
		twoDviewBtn.addEventListener("click", handle2dBtnClick);

		const screenshotButton = document.getElementById("screenshotButton");
		screenshotButton.addEventListener("click", () => {
			saveScreenshot(scene);
		});

		const OverlayButton2D = document.getElementById("2DOverlayButton");
		OverlayButton2D.addEventListener("click", () => {
			if (is2DView) {
				// Switch to 3D view
				scene.activeCamera.mode = Camera.PERSPECTIVE_CAMERA;
				is2DView = false;
			} else {
				// Switch to 2D view
				scene.activeCamera.mode = Camera.ORTHOGRAPHIC_CAMERA;
				is2DView = true;
			}
		});

		const transparentMaterial = new StandardMaterial(
			"transparentMaterial",
			scene
		);
		transparentMaterial.diffuseColor = new Color3(1, 1, 1);
		transparentMaterial.alpha = 0;
		transparentMaterial.specularColor = Color3.Black();
		transparentMaterial.emissiveColor = Color3.Black();
		transparentMaterial.ambientColor = Color3.Black();
		transparentMaterial.freeze();

		const dynamicTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
			"ImGUI",
			true,
			scene
		);

		const jetBox = MeshBuilder.CreateBox(
			"jetBox",
			{ size: 0, height: 0, width: 0, updatable: true },
			scene
		);
		jetBox.visibility = 0;
		jetBox.isPickable = false;
		jetBox.scaling.setAll(1);
		jetBox.material = transparentMaterial;

		const ellipse_jetBox = new GUI.Ellipse("ellipse_jetBox");
		ellipse_jetBox.isPointerBlocker = true;
		ellipse_jetBox.height = "7px";
		ellipse_jetBox.width = "7px";
		ellipse_jetBox.alpha = 1;
		ellipse_jetBox.background = "blue";
		ellipse_jetBox.linkOffsetY = 0;
		ellipse_jetBox.isVisible = false;
		dynamicTexture.addControl(ellipse_jetBox);
		ellipse_jetBox.linkWithMesh(jetBox);

		const camera1 = new FreeCamera(`camera1`, new Vector3(0, 0, 0), scene);

		camera1.speed = 0.6;

		camera1.lowerRadiusLimit = 0;
		camera1.upperRadiusLimit = 10;
		camera1.attachControl(canvas, true);
		scene.addCamera(camera1);

		camera1.onViewMatrixChangedObservable.add(() => {
			hideSpotLight(scene);
		});

		scene.activeCamera = scene.getCameraByName("camera1");

		// Create an arrow (or guide)
		const arrow = BABYLON.MeshBuilder.CreateCylinder(
			"arrow",
			{
				height: 1,
				diameterTop: 0,
				diameterBottom: 0.2,
				tessellation: 8,
			},
			scene
		);
		applyMeshOptimizations(arrow);
		arrow.material = new BABYLON.StandardMaterial("arrowMat", scene);
		arrow.material.diffuseColor = BABYLON.Color3.Red();
		arrow.rotation.x = Math.PI / 2;

		scene.onBeforeRenderObservable.add(() => {
			const forward = scene.activeCamera.getDirection(BABYLON.Axis.Z);
			const distance = 2;

			arrow.position = scene.activeCamera.position.add(
				forward.scale(distance)
			);
			arrow.position.y -= 0.4;

			arrow.rotation.y = scene.activeCamera.rotation.y;
			arrow.rotation.z = scene.activeCamera.rotation.z;
			arrow.rotation.x = scene.activeCamera.rotation.x + Math.PI / 2;
		});

		scene.beginAnimation(jetBox, 0, 100, true);

		scene.onBeforeRenderObservable.addOnce(() => {
			BabylonControls(scene);
		});

		return [scene];
	}

	useEffect(() => {
		setupDB()
			.then((db) => {})
			.catch((error) => {
				console.error("Database setup failed", error);
			});
		const { current: canvas } = reactCanvas;

		if (!canvas) return;

		const engine = new Engine(canvas, true, {
			preserveDrawingBuffer: true,
			stencil: true,
		});
		// look here for additional info
		// https://doc.babylonjs.com/setup/support/webGPU/webGPUOptimization/webGPUSnapshotRendering/
		engine.snapshotRendering = true;
		engine.snapshotRenderingMode =
			BABYLON.Constants.SNAPSHOTRENDERING_STANDARD;
		const [scene] = delayCreateScene(engine, baseUrl, filenameWithExtension);

		const handleSceneReady = () => {
			onSceneReady(scene);
		};

		scene.onReadyObservable.addOnce(() => {
			handleSceneReady();
		});

		const renderLoop = () => {
			scene.render();
		};

		engine.runRenderLoop(renderLoop);

		const resize = () => {
			scene.getEngine().resize();
		};

		window.addEventListener("resize", resize);

		return () => {
			engine.stopRenderLoop();
			scene.dispose();
			window.removeEventListener("resize", resize);
		};
	}, []);

	useEffect(() => {
		discs.forEach((d) => hideDisc(d));
		discs = [];
		tags.map((tag) => {
			let tagInfo = JSON.parse(tag.taggedInfo);
			let disc = drawTag(
				window.scene,
				tagInfo.tagPosition,
				`${tag.name || Date.now()}`,
				tag.type,
				tag.presence === "positive"
			);
			addTagHoverEventHandler(disc, tag);
			disc.tagInfo = tag;
			discs.push(disc);
		});
		removeTagsClone();
		displayTagsClonesHighUp();
	}, [tags]);

	return (
		<>
			<Leva
				hideCopyButton={true}
				hidden={setting}
				collapsed={true}
				titleBar={{ drag: true, filter: false }}
			/>
			<canvas
				id="renderCanvas"
				className="h-screen w-full cursor-pointer"
				ref={reactCanvas}
				{...rest}
			/>
		</>
	);
}

const setArrowGuideVisibility = (scene, visible) => {
	let arrow = scene.getMeshByName("arrow");
	if (arrow) arrow.isVisible = visible;
};

const displayImage = (imageUrl) => {
	// Check if modal already exists
	if (document.getElementById("custom-image-modal")) return;
	if (!imageUrl) {
		toast.error("No 2D image uploaded for this facility");
		return;
	}

	// Create modal container
	const modal = document.createElement("div");
	modal.id = "custom-image-modal";
	modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.8); display: flex; justify-content: center; align-items: center;
    backdrop-filter: blur(10px); z-index: 1000; opacity: 0; transition: opacity 0.3s ease-in-out;
  `;

	// Create image container for better control
	const imgContainer = document.createElement("div");
	imgContainer.style.cssText = `
    width: 90vw; height: 90vh; display: flex; justify-content: center; align-items: center;
    overflow: hidden; border-radius: 10px; box-shadow: 0 8px 16px rgba(255, 255, 255, 0.3);
  `;

	// Create image element
	const img = document.createElement("img");
	img.src = imageUrl;
	img.alt = "Preview Image";
	img.style.cssText = `
    width: 100%; height: 100%; object-fit: cover; border-radius: 10px;
    transition: transform 0.3s ease-in-out;
  `;

	// Create close button
	const closeBtn = document.createElement("button");
	closeBtn.innerHTML = "&#10006;"; // Unicode for 'X'
	closeBtn.style.cssText = `
    position: absolute; top: 20px; right: 30px; font-size: 24px; 
    background: none; color: white; border: none; cursor: pointer;
    transition: transform 0.2s ease-in-out;
  `;
	closeBtn.addEventListener(
		"mouseenter",
		() => (closeBtn.style.transform = "scale(1.2)")
	);
	closeBtn.addEventListener(
		"mouseleave",
		() => (closeBtn.style.transform = "scale(1)")
	);

	// Close function
	const closeModal = () => {
		modal.style.opacity = "0";
		setTimeout(() => modal.remove(), 300);
	};

	closeBtn.addEventListener("click", closeModal);
	modal.addEventListener("click", (e) => {
		if (e.target === modal) closeModal(); // Close when clicking outside the image
	});

	// Append elements and add to document
	imgContainer.appendChild(img);
	modal.appendChild(imgContainer);
	modal.appendChild(closeBtn);
	document.body.appendChild(modal);

	// Trigger fade-in animation
	setTimeout(() => {
		modal.style.opacity = "1";
		img.style.transform = "scale(1)";
	}, 10);
};

export function splitFileUrl(fileUrl) {
	const urlSplit = fileUrl.split("/");

	// Extract filename with extension
	const filenameWithExtension = urlSplit.pop();
	const baseUrl = urlSplit.pop();

	return [baseUrl, filenameWithExtension];
}

export const SpinnerOverlay = () => {
	return (
		<div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-80">
			<div className="h-16 w-16 animate-spin rounded-full border-t-4 border-solid border-blue-500"></div>
		</div>
	);
};

export const onSceneReady = (scene, dispatch) => {
	scene.onPointerObservable.add((pointerInfo) => {
		if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
			const pickResult = pointerInfo.pickInfo;

			if (pickResult.hit) {
				const pointCoordinates = pickResult.pickedPoint;
				if (scene.activeCamera === scene.getCameraByName("camera1")) {
					updateSpotLight(pickResult, scene);
					let event = pointerInfo.event;
					// if (event.ctrlKey) {
					//   let tagsDesc = populateTags(scene, pointCoordinates, modelId)
					//   setTagsDataGlobal(tagsDesc) // this would rewrite the former data, yes
					//   // never use this branch in prod, this is only to auto generate tags
					//   return
					// }

					// if (event.shiftKey) {
					//   persistAutoGeneratedTags()
					//   return
					// }
				}

				// this is here just in case we need to make the discs appear
				// vertically in the future, stopped working on this because
				// it will involve calculating the angle of the camera as well
				// so as to make the vertical disc face the camera,
				// this will involve saving this state in db as well.
				// so I'm ignoring this for now
				// perhaps in the future we can as well use spheres as they do not
				// have a front or back, if there is a way to make that as efficient as discs

				// let isVertical = false

				// if (pickResult.pickedMesh.getBoundingInfo().boundingBox.maximumWorld.y > pointCoordinates.y + 0.3) {
				//   isVertical = true
				// }

				if (pickResult.pickedMesh) {
					dispatch(
						dispatchSelectedMesh(
							JSON.stringify({
								tagPosition: extractPositionCoordinates(
									currTagPos || pointCoordinates
								),
								meshName: pickResult.pickedMesh?.name || "no name",
								cameraPosition:
									extractPositionCoordinates(currCameraPosition),
								cameraDirection:
									extractPositionCoordinates(currCameraDirection),
								cameraRotation: extractPositionCoordinates(
									currentCameraRotation
								),
							})
						)
					);
				}
			}
		}
	});
};

function addTagHoverEventHandler(tag, tagData) {
	tag.actionManager = new ActionManager(window.scene);

	// Show tagtip on hover
	tag.actionManager.registerAction(
		new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, function (
			event
		) {
			deleteTagTip();
			const tagtip = document.createElement("div");
			tagtip.id = "tagtip";
			tagtip.style =
				"position: fixed; background: rgba(0, 0, 0, 0.75); color: white; padding: 5px; border-radius: 5px; pointer-events: none;";
			tagtip.innerHTML = `<p> ${tagData.objectName || "unnamed object"}<br/>
        <span class='text-xs'>${
				tagData?.type === "sampling"
					? tagData?.sample
					: tagData?.type === "incident"
					? "incident"
					: ""
			}: <span class='text-xs'>${
				tagData?.type === "sampling"
					? tagData.presence
					: tagData?.type === "incident"
					? tagData?.incident
					: ""
			}
        <br/>
				 ${
						tagData.sampleDetails
							? `<span class='text-xs'>Ref: ${tagData.sampleDetails}</span><br/>`
							: ""
					}
							 ${tagData.zone ? `<span class='text-xs'>Ref: ${tagData.zone}</span><br/>` : ""}
				<span class='text-xs'>Date: ${formatDate(
					tagData.createdAt
				)}</span><br/><span class='text-xs'>Time: ${formatTime(
				tagData.createdAt
			)}</span><br/>
        ${
				tagData.slug
					? `<span class='text-xs'>Ref: ${tagData.slug}</span><br/>`
					: ""
			}
        ${
				tagData.group
					? `<span class='text-xs'>Group: ${tagData.group}</span></p>`
					: "</p>"
			}`;
			tagtip.style.display = "block";
			tagtip.style.left = event.pointerX + 10 + "px";
			tagtip.style.top = event.pointerY + 10 + "px";
			document.body.appendChild(tagtip);
		})
	);

	function deleteTagTip() {
		var tagtip = document.getElementById("tagtip");
		tagtip?.remove();
	}

	tag.actionManager.registerAction(
		new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, function () {
			deleteTagTip();
		})
	);
}

function addTagClickEventHandler(tag, tagData) {
	tag.actionManager = new ActionManager(window.scene);
	let taggedInfo = JSON.parse(tagData.taggedInfo);

	tag.actionManager.registerAction(
		new ExecuteCodeAction(ActionManager.OnPickDownTrigger, function (event) {
			if (saveCameraPositionAndDirection.inSunView) {
				returnToNormalView();
				resetCameraLocation(taggedInfo);
			}
		})
	);
}

function returnToNormalView() {
	removeTagsClone();
	saveCameraPositionAndDirection.inSunView = false;
	window.scene.activeCamera.position =
		saveCameraPositionAndDirection.position.clone();
	window.scene.activeCamera.direction =
		saveCameraPositionAndDirection.direction.clone();
	window.scene.activeCamera.rotation =
		saveCameraPositionAndDirection.rotation.clone();
	setArrowGuideVisibility(window.scene, true);
}

export const stopRecording = (videoRecorder) => {
	videoRecorder.isRecording &&
		videoRecorder.stopRecording((blob) => {
			const videoUrl = URL.createObjectURL(blob);
			const videoElement = document.createElement("a");
			videoElement.style.display = "block";
			videoElement.style.width = "300px";
			videoElement.style.height = "50px";
			videoElement.style.margin = "0 auto";
			videoElement.style.position = "absolute";
			videoElement.style.top = "10px";
			videoElement.style.zIndex = "999";
			videoElement.href = videoUrl;
			videoElement.download = "recorded_video.mp4";
			videoElement.innerHTML = "Download Video";
			document.body.appendChild(videoElement);
			toast.success("Video recording stopped successfully");
		});
	toast.success("Video recording stopped");
};

export const startRecording = (videoRecorder) => {
	const maxRecordingDuration = 60 * 2 * 1000;
	videoRecorder.startRecording("video-record.webm", maxRecordingDuration);
	toast.success("Video recording started");
	setTimeout(() => {
		stopRecording(videoRecorder);
	}, maxRecordingDuration);
};

export const setupVideoRecording = (scene) => {
	const engine = scene.getEngine();
	if (VideoRecorder.IsSupported(engine)) {
		const videoRecorder = new VideoRecorder(engine, { fps: 30 });
		const recordButton = document.getElementById("recordButton");
		recordButton.addEventListener("click", () => {
			if (!videoRecorder.isRecording) {
				startRecording(videoRecorder);
				recordButton.style.backgroundColor = "red";
			} else {
				stopRecording(videoRecorder);
				recordButton.style.backgroundColor = "";
			}
		});
	}
};

export function saveScreenshot(scene) {
	Tools.CreateScreenshot(
		scene.getEngine(),
		scene.activeCamera,
		{ width: 1024, height: 900 },
		null,
		true
	);
	toast.success("Screenshot saved");
}

export function updateSpotLight(pickInfo, scene) {
	hideSpotLight();
	const clickedPoint = pickInfo.pickedPoint;
	if (!clickedPoint) return;
	updateCameraPosition(scene);
	let position = new Vector3(
		clickedPoint.x,
		clickedPoint.y + 1.7,
		clickedPoint.z
	);
	currTagPos = position;
	window.currTagPos = currTagPos;
	currSpotlight = createDiscAtPosition("spotLight", position, scene);
}

export function hideSpotLight() {
	if (currSpotlight) {
		currSpotlight.isVisible = false;
		currSpotlight.dispose();
		currSpotlight = null;
		currTagPos = null;
		window.currTagPos = currTagPos;
	}
}

export function hideDisc(disc) {
	if (disc) {
		disc.isVisible = false;
		disc.dispose();
	}
}

function makeColorFromType(type, isPositive) {
	if (!type) {
		return new BABYLON.Color3(1, 0, 0);
	}
	switch (type) {
		case "sampling":
			if (isPositive) return new BABYLON.Color3(1, 0, 0);
			return new BABYLON.Color3(0, 0.5, 0.5);
		case "incident":
			return new BABYLON.Color3(1, 0, 0);
		default:
			return new BABYLON.Color3(1, 0, 0);
	}
}

function createDiscAtPosition(
	name,
	position,
	scene,
	isTag = false,
	type = "",
	isPositive = false
) {
	// small radius to make it appear as a tiny dot
	const TAG_DISC_RADIUS = 0.03;
	const disc = BABYLON.MeshBuilder.CreateDisc(
		`${name || Date.now()}`,
		{ radius: TAG_DISC_RADIUS, tessellation: 48 },
		scene
	);
	disc.__isTag = true;
	const material = new BABYLON.StandardMaterial(name, scene);
	if (isTag) {
		material.diffuseColor = makeColorFromType(type, isPositive);
	} else {
		material.diffuseColor = new BABYLON.Color3(0, 0, 1); // Blue color
	}
	disc.material = material;

	applyOpRecursivelyOnSubmeshes(disc, () => {
		applyMeshOptimizations(disc);
	});

	disc.position = new Vector3(position.x, position.y - 1.6, position.z);
	disc.rotation.x = Math.PI / 2;
	return disc;
}

export function drawTag(
	scene,
	position,
	name = `${Date.now()}`,
	type,
	isPositive
) {
	if (!position) return;
	if (!scene) return;
	return createDiscAtPosition(name, position, scene, true, type, isPositive);
}

function displayTagsClonesHighUp() {
	if (!saveCameraPositionAndDirection.inSunView) {
		return;
	}

	const camera = window.scene.activeCamera;

	discs.forEach((disc) => {
		let discClone = disc.clone(disc.name + "_clone");
		discClone.unfreezeWorldMatrix();
		addTagClickEventHandler(discClone, disc.tagInfo);
		const diffX = camera.position.x - discClone.position.x;
		const diffY = camera.position.y - discClone.position.y;
		const diffZ = camera.position.z - discClone.position.z;
		discClone.position.x = discClone.position.x + diffX / 2;
		discClone.position.y = discClone.position.y + diffY / 2;
		discClone.position.z = discClone.position.z + diffZ / 2;
		discClone.scaling.scaleInPlace(10);
		discsClone.push(discClone);
	});
}

function removeTagsClone() {
	if (!saveCameraPositionAndDirection.inSunView) {
		return;
	}
	discsClone.forEach((disc) => {
		disc.isVisible = false;
		disc.dispose();
	});
	discsClone = [];
}

export function replaceInstanceWithClone(instanceMesh) {
	if (!instanceMesh.ownerMesh) {
		console.warn("The provided mesh is not an instance mesh.");
		return;
	}
	var masterMesh = instanceMesh.ownerMesh;
	var clonedMesh = masterMesh.clone("clonedMesh");
	clonedMesh.position.copyFrom(instanceMesh.position);
	clonedMesh.rotationQuaternion.copyFrom(instanceMesh.rotationQuaternion);
	clonedMesh.scaling.copyFrom(instanceMesh.scaling);
	instanceMesh.dispose();

	return clonedMesh;
}

export function deconstructMesh(mesh, scene) {
	if (mesh.subMeshes.length > 1) {
		var otherVertexData = VertexData.ExtractFromMesh(mesh, true, true);
		var indices = otherVertexData.indices;
		var normals = otherVertexData.normals;
		var positions = otherVertexData.positions;
		var uvs = otherVertexData.uvs;
		var newMeshArray = [];
		for (let index = 0; index < mesh.subMeshes.length; index++) {
			var newVertexData = new VertexData();

			var newI = indices.slice(
				mesh.subMeshes[index].indexStart,
				mesh.subMeshes[index].indexStart + mesh.subMeshes[index].indexCount
			);
			var newN = normals.slice(
				mesh.subMeshes[index].verticesStart * 3,
				mesh.subMeshes[index].verticesStart * 3 +
					mesh.subMeshes[index].verticesCount * 3
			);
			var newP = positions.slice(
				mesh.subMeshes[index].verticesStart * 3,
				mesh.subMeshes[index].verticesStart * 3 +
					mesh.subMeshes[index].verticesCount * 3
			);
			var newU = uvs.slice(
				mesh.subMeshes[index].verticesStart * 2,
				mesh.subMeshes[index].verticesStart * 2 +
					mesh.subMeshes[index].verticesCount * 2
			);
			for (let subIndex = 0; subIndex < newI.length; subIndex++) {
				newI[subIndex] =
					newI[subIndex] - mesh.subMeshes[index].verticesStart;
			}

			newVertexData.indices = newI;
			newVertexData.normals = newN;
			newVertexData.positions = newP;
			newVertexData.uvs = newU;

			var meshSubclass = new Mesh(mesh.name + "-" + index, scene);

			newVertexData.applyToMesh(meshSubclass);

			newMeshArray.push(meshSubclass);
		}
		return newMeshArray;
	} else {
		return [mesh];
	}
}

function updateCameraPosition(scene) {
	currCameraPosition = scene.activeCamera.position;
	window.currCameraPosition = currCameraPosition; // to-do: use redux
	currCameraDirection = scene.activeCamera.getForwardRay().direction.clone();
	window.currCameraDirection = currCameraDirection;
	currentCameraRotation = scene.activeCamera.rotation;
	window.currentCameraRotation = currentCameraRotation;
}

function applyMeshOptimizations(mesh) {
	// applyOcclusionAlgo(mesh)
	mesh.isReady() && mesh.freezeWorldMatrix(); // causes model corruption on some systems
	mesh.cullingStrategy =
		BABYLON.AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY;
	mesh.isPickable = true; // because .performancePriority == BABYLON.ScenePerformancePriority.Aggressive
}

function applyOpRecursivelyOnSubmeshes(mesh, op, key = "__visited__") {
	if (key.length && mesh[key]) return;
	// maybe meshes could contain parent meshes as submeshes?
	// so this is a hack to prevent cyclical recursion
	// now this implies applyOpRecursivelyOnSubmeshes can only be called
	// only once in one place with same key, to call this again we need
	// use a different key, to ignore totally, just pass an empty string
	mesh[key] = true;
	op(mesh);
	mesh.subMeshes?.forEach((m) => applyOpRecursivelyOnSubmeshes(m, op, key));
}

function applyOcclusionAlgo(mesh) {
	// does not work well
	mesh.occlusionRetryCount = 5;
	mesh.occlusionQueryAlgorithmType =
		BABYLON.AbstractMesh.OCCLUSION_ALGORITHM_TYPE_ACCURATE;
	mesh.occlusionType = BABYLON.AbstractMesh.OCCLUSION_TYPE_STRICT;
}

function loadSceneFromGlb(url, scene, model) {
	const urlSplit = url.split("/");
	let fileName = urlSplit.pop();
	// deleteFromDb(url).then(console.log) // just in case to force refetch
	// return
	return checkUrlInIndexedDb(url)
		.then((result) => {
			console.log(result);
			if (result.isInDb) {
				const glFile = new File([result.blob], fileName, {
					// type: "model/gltf-binary"
				});

				return importGLFileInScene(glFile, scene);
			} else {
				console.log("fetching model from server");
				return downloadModel(url, model, scene, fileName);
			}
		})
		.catch((e) => {
			console.error(e);
			console.log("fetching model from server after error");
			return downloadModel(url, model, scene, fileName);
		});
}

async function downloadModel(url, model, scene, fileName) {
	return fetch(url)
		.then((response) => response.blob())
		.then((blob) => {
			if (model.size && blob.size !== model.size) {
				// retry ank keep count
				let currentRetries = Number(
					localStorage.getItem("retriesCount") || 0
				);
				if (currentRetries >= 3) {
					toast.error(
						"model load max retries reached, please check your network or reupload this model"
					);
					localStorage.setItem("retriesCount", "0");
					return setTimeout(() => {
						window.location.href = "/";
					}, 5000);
				}
				localStorage.setItem("retriesCount", `${currentRetries + 1}`);
				window.location.reload();
				return;
			}
			localStorage.setItem("retriesCount", "0");
			const glFile = new File([blob], fileName, {
				// type: "model/gltf-binary"
			});

			storeBlobInDb(url, blob);

			return importGLFileInScene(glFile, scene);
		});
}

function importGLFileInScene(glFile, scene) {
	return new Promise((resolve) => {
		SceneLoader.ImportMeshAsync("", "", glFile, scene).then((result) => {
			result.meshes.forEach((mesh) => {
				applyOpRecursivelyOnSubmeshes(mesh, () => {
					applyMeshOptimizations(mesh);
				});
			});
			centerCameras(scene);
			resolve();
		});
	});
}

function centerCameras(scene, setSunAngleCamera = false) {
	const loadedMeshes = scene.meshes;

	// Calculate the bounding box
	const centroid = Vector3.Zero();
	let maxExtent = 0;
	loadedMeshes.forEach((mesh) => {
		const tagPosition = mesh.getAbsolutePosition();
		centroid.addInPlace(tagPosition);
		const distance = Vector3.Distance(tagPosition, centroid);
		if (distance > maxExtent) {
			maxExtent = distance;
		}
	});
	centroid.scaleInPlace(1 / loadedMeshes.length);

	if (setSunAngleCamera) {
		let camera = scene.getCameraByName("camera1");
		camera.position = centroid.clone();
		camera.rotation.x = Math.PI / 2;
		camera.position.y += 150;
	} else {
		scene.getCameraByName("camera1").position = centroid.clone();
	}
}

export function resetCameraLocation(desc) {
	if (!desc) return;
	if (!window.scene) return;
	let scene = window.scene;
	let camera = scene.getCameraByName("camera1");
	if (!camera) return;
	if (typeof desc === "string") {
		desc = JSON.parse(desc);
	}
	camera.position = new Vector3(
		desc.cameraPosition.x,
		desc.cameraPosition.y,
		desc.cameraPosition.z
	);
	camera.direction = new Vector3(
		desc.cameraDirection.x,
		desc.cameraDirection.y,
		desc.cameraDirection.z
	);
	camera.rotation = new Vector3(
		desc.cameraRotation.x,
		desc.cameraRotation.y,
		desc.cameraRotation.z
	);
}

function extractPositionCoordinates(position) {
	let x = 0;
	let y = 0;
	let z = 0;
	if (!position) return { x, y, z };
	x = position.x || position._x;
	y = position.y || position._y;
	z = position.z || position._z;
	return { x, y, z };
}
function openDb() {
	return new Promise((resolve, reject) => {
		// open (or create) database "models" with version 1
		const request = indexedDB.open("models", 1);

		// runs the first time or when version changes
		request.onupgradeneeded = function (event) {
			const db = event.target.result;
			// create object store "glb" if it doesn’t exist
			if (!db.objectStoreNames.contains("glb")) {
				db.createObjectStore("glb", { keyPath: "url" });
			}
		};

		// DB opened successfully
		request.onsuccess = function (event) {
			resolve(event.target.result);
		};

		// failed to open DB
		request.onerror = function (event) {
			reject(event);
		};
	});
}

function getBlobFromDb(url) {
	return openDb().then((db) => {
		return new Promise((resolve, reject) => {
			// open transaction in readonly mode
			const transaction = db.transaction(["glb"], "readonly");
			const store = transaction.objectStore("glb");

			// try to get the record by url
			const objectStoreRequest = store.get(url);
			objectStoreRequest.onsuccess = () => {
				if (!objectStoreRequest.result) {
					// nothing found in DB
					return reject({ error: "no record in db for " + url });
				}
				// return stored blob
				resolve(objectStoreRequest.result.blob);
			};

			objectStoreRequest.onerror = () => {
				reject({ error: "failed to retrieve data for " + url });
			};
		});
	});
}

function storeBlobInDb(url, blob) {
	return openDb().then((db) => {
		return new Promise((resolve, reject) => {
			// open transaction in readwrite mode
			const transaction = db.transaction(["glb"], "readwrite");
			const store = transaction.objectStore("glb");

			// insert or update record
			const objectStoreRequest = store.put({ url, blob });
			objectStoreRequest.onsuccess = () => {
				resolve({ success: "data stored for " + url });
			};

			objectStoreRequest.onerror = () => {
				reject({ error: "failed to store data for " + url });
			};
		});
	});
}

export function deleteFromDb(url) {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("models", 1);

		request.onsuccess = function (event) {
			const db = event.target.result;
			const transaction = db.transaction(["glb"], "readwrite");
			const store = transaction.objectStore("glb");

			const objectStoreRequest = store.delete(url);
			objectStoreRequest.onsuccess = () => {
				resolve({ success: "data deleted for " + url });
			};

			objectStoreRequest.onerror = () => {
				reject({ error: "failed to delete data for " + url });
			};
		};

		request.onerror = (event) => {
			reject({ error: "Failed to open database", event: event });
		};
	});
}

function checkUrlInIndexedDb(url) {
	return getBlobFromDb(url)
		.then((blob) => {
			return { isInDb: true, blob };
		})
		.catch(() => {
			return { isInDb: false };
		});
}

function indexDb() {
	// Store the blob
	function storeBlob(blob) {
		const request = indexedDB.open("models", 1);

		request.onsuccess = function (event) {
			const db = event.target.result;
			const transaction = db.transaction("glb", "readwrite");
			const store = transaction.objectStore("glb");

			// Put the blob data into the store with a unique id
			const id = Date.now(); // or generate any unique ID
			store.put({ id, blob });
		};
	}

	// Example: storing a 1GB blob
	const blob = new Blob([new Uint8Array(1e9)], {
		type: "application/octet-stream",
	});
	storeBlob(blob);
}

function setupDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("models", 1);

		// Handle database setup
		request.onupgradeneeded = function (event) {
			const db = event.target.result;
			if (!db.objectStoreNames.contains("glb")) {
				db.createObjectStore("glb", { keyPath: "url" });
			}
		};

		request.onsuccess = function (event) {
			const db = event.target.result;
			resolve(db);
		};

		request.onerror = function (event) {
			reject(event);
		};
	});
}

function populateTags(scene, position, modelId) {
	const originalX = position.x;
	const originalZ = position.z;
	const tagTypes = ["sampling", "incident"];

	let tagDescs = [];
	for (let i = 0; i < 50; i++) {
		const negOrPositive = i % 2 == 0 ? -1 : 1;
		const offsetX = Math.random() * 20 * negOrPositive;
		const offsetZ = Math.random() * 20 * negOrPositive;

		const tagType = tagTypes[Math.floor(Math.random() * 2)];

		const randomPosition = new Vector3(
			originalX + offsetX,
			position.y + 1.7,
			originalZ + offsetZ
		);

		let { cameraPosition, cameraRotation, cameraDirection } =
			getCamDetailsLookingDown(randomPosition);
		let taggedInfo = JSON.stringify({
			tagPosition: extractPositionCoordinates(randomPosition),
			meshName: "Auto",
			cameraPosition: extractPositionCoordinates(cameraPosition),
			cameraDirection: extractPositionCoordinates(cameraDirection),
			cameraRotation: extractPositionCoordinates(cameraRotation),
		});

		let tagDesc = getTagProps(modelId, taggedInfo, tagType);
		tagDesc._id = Date.now() * Math.random();
		tagDescs.push(tagDesc);
		globalTagDescs.push(tagDesc);
	}
	console.log(globalTagDescs.length);
	return tagDescs;
}

async function persistAutoGeneratedTags() {
	await Promise.all(
		globalTagDescs.map(async (tagDesc) => {
			const formDataForUpload = new FormData();
			Object.entries(tagDesc).forEach(([key, value]) => {
				formDataForUpload.append(key, value);
			});
			await customFetch.post("/tag/add", formDataForUpload);
		})
	);
	console.log("tags persisted");
}

function getCamDetailsLookingDown(targetPosition, heightOffset = 2) {
	// Calculate camera's position
	const cameraPosition = new Vector3(
		targetPosition.x,
		targetPosition.y + heightOffset, // Height above the target
		targetPosition.z
	);

	const cameraRotation = new Vector3(0, 0, 0);
	cameraRotation.x = Math.PI / 2;

	const cameraDirection = new Vector3(0, 0, 0);

	return { cameraPosition, cameraRotation, cameraDirection };
}

function setSpecificIncidentProps(obj) {
	const types = ["Safety", "Crack", "Spill"];
	obj.incident = types[Math.floor(Math.random() * types.length)];
	obj.type = "incident";
	setActionBasedOnType(obj, "incident");
}

function setSpecificSampleProps(obj) {
	const types = ["Salmonella", "Listeria", "Shigella"];
	obj.sample = types[Math.floor(Math.random() * types.length)];
	obj.type = "sampling";
	let presence = ["positive", "negative"];
	obj.presence = presence[Math.floor(Math.random() * presence.length)];
	setActionBasedOnType(obj, "sampling");
}

function getTagProps(modelId, taggedInfo, tagType) {
	if (!modelId) {
		throw new Error("model id required");
	}
	if (!taggedInfo) {
		throw new Error("taggedInfo required");
	}
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser;

	if (!currentUser) {
		throw new Error("user required");
	}

	if (!tagType) {
		throw new Error("tagType required");
	}

	const userId = currentUser._id;
	const userName = currentUser.fullname;

	let obj = {};

	obj.fullname = userName;
	obj.objectName = "Auto";
	obj.group = "floor";
	obj.location = "room x";
	obj.userId = userId;
	obj.modelId = modelId;
	obj.taggedInfo = taggedInfo;
	if (tagType == "sampling") {
		setSpecificSampleProps(obj);
	} else if ((tagType = "incident")) {
		setSpecificIncidentProps(obj);
	} else {
		throw new Error("unkonw tag type");
	}
	return obj;
}

function setActionBasedOnType(obj, tagType) {
	obj.action = getRandomAction(tagType);
}

const samplingRemedialActions = [
	"Area was swabbed with a 70% isopropyl alcohol solution.",
	"Sample was re-collected and sent to the lab for analysis.",
	"Equipment was decontaminated using a bleach solution.",
	"Affected area was isolated and sanitized with quaternary ammonium.",
	"Air sampling was conducted to assess the level of contamination.",
	"Surfaces were cleaned with a hydrogen peroxide-based disinfectant.",
	"A new sampling protocol was implemented to prevent recurrence.",
	"Personnel were retrained on proper sampling techniques.",
	"The sampling location was moved to a more representative area.",
	"All potentially contaminated materials were removed and disposed of.",
];

const safetyRemedialActions = [
	"Workers were educated further on safety measures regarding machinery use.",
	"A new safety protocol was implemented for the specific task.",
	"The faulty equipment was taken out of service for repair.",
	"Additional safety signage was installed in the affected area.",
	"A safety inspection was conducted to identify potential hazards.",
	"Personal protective equipment (PPE) was provided to all workers.",
	"The incident was reviewed with all personnel to prevent future occurrences.",
	"A root cause analysis was performed to determine the underlying cause.",
	"Workers were given a refresher course on lock-out/tag-out procedures.",
	"The work area was reorganized to improve safety and ergonomics.",
];

// Example usage:
function getRandomAction(type) {
	if (type === "sampling") {
		const randomIndex = Math.floor(
			Math.random() * samplingRemedialActions.length
		);
		return samplingRemedialActions[randomIndex];
	} else if (type === "incident") {
		const randomIndex = Math.floor(
			Math.random() * safetyRemedialActions.length
		);
		return safetyRemedialActions[randomIndex];
	} else {
		return "Further investigation is required to determine appropriate action.";
	}
}