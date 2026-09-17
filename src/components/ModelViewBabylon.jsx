import { useDispatch } from "react-redux";
import {
	SceneComponent,
	SpinnerOverlay,
	onSceneReady,
	splitFileUrl,
} from "./SceneComponent";
import { useState } from "react";
// eslint-disable-next-line react/prop-types
export default function ModelViewBabylon({
	MODEL_URL,
	tags,
	model,
	setTagsData,
}) {
	const MODEL_URL_VALID = MODEL_URL
		? MODEL_URL
		: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/ToyCar/glTF-Binary/ToyCar.glb";
	const [baseUrl, filenameWithExtension] = splitFileUrl(MODEL_URL_VALID);
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(true);

	return (
		<div className="relative h-screen w-full">
			{isLoading && <SpinnerOverlay />}

			{/* Model name overlay: fixed within this viewer container, always visible above the canvas */}
			<div
				className="pointer-events-none absolute right-3 top-3 z-[1000] select-none rounded-md bg-black/60 px-3 py-1 text-sm font-semibold text-white shadow"
				aria-label="Current model name"
			>
				{model?.modelName || "Model"}
			</div>

			<SceneComponent
				baseUrl={baseUrl}
				filenameWithExtension={filenameWithExtension}
				tags={tags}
				setIsLoading={setIsLoading}
				setTagsData={setTagsData}
				onSceneReady={(e) => onSceneReady(e, dispatch)}
				model={model}
			/>
		</div>
	);
}
