// eslint-disable-next-line no-unused-vars
import React, { useEffect, useMemo, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { useNavigate } from "react-router-dom";
import "../styles/singleModel.css";

import { FormInput } from "../components";
import { CiCirclePlus } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { memoize } from "proxy-memoize";
import { customFetch } from "../utils";
import { toast } from "react-toastify";
import { Button, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { dispatchSelectedMeshTags } from "../redux/actions/meshActions";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";

const TagModelForm = ({
	model,
	setTagsData,
	tagsData,
	tagType,
	onCancel,
	objectGroups = [],
}) => {
	const dispatch = useDispatch();

	const [samples, setSamples] = useState([]);
	const [incidents, setIncidents] = useState([]);
	const [addSample, setAddSample] = useState(false);
	const [addIncident, setAddIncident] = useState(false);
	const [newTaggedInfoName, setNewTaggedInfoName] = useState("");
	const [newTaggedInfoPosition, setNewTaggedInfoPosition] = useState();
	const [newTaggedInfo, setNewTaggedInfo] = useState();
	const [customData, setCustomData] = useState(false);
	const [evidenceName, setEvidenceName] = useState("");
	const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
	const [time, setTime] = useState(
		new Date().toLocaleTimeString("it-IT", {
			hour: "2-digit",
			minute: "2-digit",
		})
	);
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const goBack = () => {
		navigate(-1);
	};

	const availableGroups = useMemo(() => {
		const names = new Set();
		(objectGroups || []).forEach((group) => {
			const name = (group?.name || "").trim();
			if (name) names.add(name);
		});
		(tagsData || []).forEach((tag) => {
			const name = (tag?.group || "").trim();
			if (name) names.add(name);
		});
		return Array.from(names);
	}, [objectGroups, tagsData]);

	async function fetchSamples() {
		await customFetch.get("/sample/samples").then(({ data }) => {
			if (data?.data) {
				const samplesNew = data.data.map((item) => ({
					label: item.name,
					value: item._id,
				}));
				setSamples(samplesNew);
			}
		});
	}

	async function fetchIncidents() {
		await customFetch.get("/incident/incidents").then(({ data }) => {
			if (data?.data) {
				const IncidentsNew = data.data.map((item) => ({
					label: item.name,
					value: item._id,
				}));
				setIncidents(IncidentsNew);
			}
		});
	}

	useEffect(() => {
		fetchSamples();
		fetchIncidents();
	}, [addSample, addIncident]);

	useEffect(() => {
		const tags = model?.tags;
		if (tags) {
			dispatch(dispatchSelectedMeshTags(tags));
		}
	}, [dispatch, model]);

	const user = useSelector((state) => state.userState.user);
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser || user;
	const [isSubmitting, setIsSubmitting] = useState(false);
	// ensure type is set from tagType immediately so conditional fields render before submit
	useEffect(() => {
		setFormData((prev) => ({
			...prev,
			type: tagType === "sample" ? "sampling" : "incident",
		}));
	}, [tagType]);

	// eslint-disable-next-line no-unused-vars
	const modelInterationData = useSelector(
		memoize((state) => state.selectedMeshState.data)
	);

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

	useEffect(() => {
		const [meshName, tagPosition] =
			destructureTaggedInfo(modelInterationData);
		if (
			meshName &&
			destructureTaggedInfo(modelInterationActiveData?.taggedInfo)[0]
		) {
			setNewTaggedInfoName(modelInterationActiveData.objectName);
		} else {
			setNewTaggedInfoName(meshName);
		}
		setNewTaggedInfoPosition(tagPosition);
		setNewTaggedInfo(modelInterationData);
	}, [modelInterationData, modelInterationActiveData]);
	// eslint-disable-next-line no-unused-vars
	const [formData, setFormData] = useState({
		fullname: currentUser.fullname,
		incident: "",
		evidence: "",
		type: "",
		action: "",
		zone: "",
		sampleDetails: "",
		locations: "",
		presence: "",
		sample: "",
		group: "",
		user: currentUser?._id,
		model: model?._id,
		text: "",
		objectName: newTaggedInfoName,
		taggedInfo: newTaggedInfoPosition,
	});

	const handleInputChange = (e) => {
		const { name, value, files } = e.target;
		if (name === "evidence") {
			setEvidenceName(files[0].name);
		}
		setFormData({
			...formData,
			[name]: files ? files[0] : value || "",
		});
	};

	const resetFormState = () => {
		setFormData({
			fullname: currentUser.fullname,
			incident: "",
			evidence: "",
			type: "",
			action: "",
			zone: "",
			sampleDetails: "",
			locations: "",
			presence: "",
			sample: "",
			group: "",
			user: currentUser?._id,
			model: model?._id,
			text: "",
			objectName: "",
			taggedInfo: "",
		});
		setEvidenceName("");
		setCustomData(false);
		setNewTaggedInfo(undefined);
		setNewTaggedInfoName("");
		setNewTaggedInfoPosition(undefined);
		setDate(new Date().toISOString().split("T")[0]);
		setTime(
			new Date().toLocaleTimeString("it-IT", {
				hour: "2-digit",
				minute: "2-digit",
			})
		);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const dateTime = new Date(`${date}T${time}`);
		if (tagType === "sample") {
			formData.type = "sampling";
		} else {
			formData.type = "incident";
		}

		if (!newTaggedInfo) {
			toast.error(
				"Please ensure you have clicked an object to tag, aborting"
			);
			return;
		}

		if (
			formData.type === "sampling" &&
			(!formData.sample || !formData.presence)
		) {
			toast.error("Please ensure you have set sample type and result");
			return;
		}

		setIsSubmitting(true);
		try {
			const formDataForUpload = new FormData();
			formDataForUpload.append("fullname", formData.fullname);
			formDataForUpload.append("incident", formData.incident);
			formDataForUpload.append("objectName", newTaggedInfoName);
			formDataForUpload.append("type", formData.type);
			formDataForUpload.append("evidence", formData.evidence);
			formDataForUpload.append("action", formData.action);
			formDataForUpload.append("zone", formData.zone);
			formDataForUpload.append("sampleDetails", formData.sampleDetails);
			formDataForUpload.append("locations", formData.locations);
			formDataForUpload.append("sample", formData.sample);
			formDataForUpload.append("presence", formData.presence);
			formDataForUpload.append("group", formData.group);
			formDataForUpload.append("text", formData.text);
			formDataForUpload.append("taggedInfo", newTaggedInfo);
			formDataForUpload.append("userId", currentUser?._id);
			formDataForUpload.append("modelId", model?._id);
			formDataForUpload.append("createdAt", dateTime.toISOString());

			const response = await customFetch.post("/tag/add", formDataForUpload);
			console.log("Response after adding tag:", response);

			if (response.data?.status !== "error") {
				toast.success(`Tag added successfully`);
				// drop tag visible
				let tags = [...tagsData];
				const newTag = {
					...formData,
					taggedInfo: newTaggedInfo,
					objectName: newTaggedInfoName,
					_id: response.data.data._id,
					slug: response.data.data.slug,
					group: response.data.data.group || "",
					evidence: response.data.data.evidence || "",
					zone: response.data.data.zone || formData.zone || "",
					sampleDetails:
						response.data.data.sampleDetails ||
						formData.sampleDetails ||
						"",
					createdAt: dateTime.toISOString(),
				};
				tags.push(newTag);
				setTagsData(tags);
				if (model.tags) {
					model.tags = [...model.tags, newTag];
				} else {
					model.tags = tags;
				}
			} else {
				toast.error(response.data?.message);
			}
			resetFormState();
		} catch (error) {
			console.log(error);
			const errorMessage = error?.response?.data?.msg || "Error adding Tag";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="dataHistoryWrapper">
			{/* header */}
			<div className="header px-2">
				<h1 className="text-2xl font-medium">Add {tagType}</h1>
			</div>
			{/* header end */}

			<form
				onSubmit={handleSubmit}
				method="POST"
				encType="multipart/form-data"
				className="mx-auto flex h-screen w-full flex-grow flex-col items-center justify-between gap-10"
			>
				<div className="flex w-full flex-col gap-4 p-2">
					<div className="flex flex-col">
						<FormInput
							onChange={(e) => {
								handleInputChange(e);
								setNewTaggedInfoName(e.target.value);
							}}
							label="Object Name"
							type="text"
							name="objectName"
							placeholder="Object Name"
							size="input-sm"
							value={newTaggedInfoName}
						/>
						<FormInput
							onChange={handleInputChange}
							label="Location"
							type="text"
							name="locations"
							placeholder="Please type location"
							size="input-sm"
							value={formData.locations}
						/>

						{/* add time selector and date, combine date and time to set createdAt */}
						<div className="grid grid-cols-2 gap-4">
							<FormInput
								type="date"
								label="Date"
								name="date"
								value={date}
								onChange={(e) => setDate(e.target.value)}
							/>
							<FormInput
								type="time"
								label="Time"
								name="time"
								value={time}
								onChange={(e) => setTime(e.target.value)}
							/>
						</div>

						{tagType === "sample" ? (
							<div className="form-control">
								<FormInput
									onChange={handleInputChange}
									label="Type of sample"
									type="text"
									name="sample"
									placeholder="Please enter the type of sample"
									size="input-sm"
									value={formData.sample}
									options={["Salmonella", "Listeria"]}
								/>
							</div>
						) : null}

						{tagType === "sample" ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<div className="form-control">
									<label className="mb-1 text-sm font-medium">
										Zone of sample
									</label>
									<select
										name="zone"
										value={formData.zone}
										onChange={handleInputChange}
										className="w-full p-2 border rounded"
									>
										<option value="" disabled>
											Select zone
										</option>
										{[
											"Zone 1",
											"Zone 2",
											"Zone 3",
											"Zone 4",
											"Zone 5",
											"Other",
										].map((z) => (
											<option key={z} value={z}>
												{z}
											</option>
										))}
									</select>
								</div>

								<div className="form-control">
									<label className="mb-1 text-sm font-medium">
										Sample details
									</label>
									<select
										name="sampleDetails"
										value={formData.sampleDetails}
										onChange={handleInputChange}
										className="w-full p-2 border rounded"
									>
										<option value="" disabled>
											Select detail
										</option>
										{[
											"Random",
											"Routine",
											"Investigational",
											"Construction",
											"Vector",
											"PEC",
											"PIC",
											"Other",
										].map((o) => (
											<option key={o} value={o}>
												{o}
											</option>
										))}
									</select>
								</div>
							</div>
						) : null}

						{tagType === "incident" ? (
							<div className="form-control">
								<FormInput
									onChange={handleInputChange}
									label="Incident"
									type="text"
									name="incident"
									placeholder="Incident"
									size="input-sm"
									value={formData.incident}
									options={["Safety", "Crack", "Spill"]}
								/>
							</div>
						) : null}
						{tagType === "sample" ? (
							<div className="form-control mt-5">
								<select
									onChange={handleInputChange}
									name="presence"
									value={formData.presence}
									required
									className="w-full p-2 border rounded"
								>
									<option value="" disabled>
										Result
									</option>
									{[
										{ value: "positive", label: "positive" },
										{ value: "negative", label: "negative" },
									].map((item) => (
										<option key={item.value} value={item.value}>
											{item.label}
										</option>
									))}
								</select>
							</div>
						) : null}
						<div className="form-control">
							<label className="mb-1 text-sm font-medium">Group</label>
							<select
								name="group"
								value={formData.group}
								onChange={handleInputChange}
								className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
							>
								<option value="">
									{availableGroups.length
										? "Select group"
										: "No groups available"}
								</option>
								{availableGroups.map((group) => (
									<option key={group} value={group}>
										{group}
									</option>
								))}
							</select>
						</div>
						{["sampling", "incident"].includes(formData.type) ? (
							<FormInput
								onChange={handleInputChange}
								label="Corrective Actions"
								placeholder="Corrective Actions"
								type="text"
								name="action"
								size="input-sm"
								value={formData?.action}
							/>
						) : null}
						<div className="border-1 input input-sm input-bordered mt-5 flex h-auto min-h-10 flex-col items-center justify-center gap-1">
							<Button
								onClick={() => {
									setCustomData(!customData);
								}}
								className="capitalize"
							>
								<Typography>Note</Typography>
								<CiCirclePlus />
							</Button>
						</div>
						{customData ? (
							<div className="mt-5 flex h-auto w-full flex-col">
								<textarea
									className="h-auto w-full rounded-md"
									rows={4}
									cols={10}
									onChange={handleInputChange}
									label="text"
									placeholder="Please enter additional data here"
									type="text"
									name="text"
									size="input-sm"
									value={formData?.text}
								/>
							</div>
						) : null}
						<div className="form-control">
							<label htmlFor="evidence" className="label">
								<span className="label-text capitalize">
									Evidence/Image
								</span>
							</label>
							<input
								type="file"
								name="evidence"
								accept=".jpg, .jpeg, .png, .webp"
								onChange={handleInputChange}
								placeholder={evidenceName || "File upload"}
								className={`input input-sm input-bordered h-10`}
							/>
						</div>
					</div>
					<div className="flex w-full flex-col items-center justify-center gap-2 py-1">
						<Button
							className="btn btn-neutral h-10 w-full border-solid"
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<span className="loading loading-spinner"></span>
									processing...
								</>
							) : (
								"Submit"
							)}
						</Button>
						<Button
							className="btn btn-outline btn-neutral btn-sm h-10 w-full border-solid"
							type="button"
							onClick={() => {
								resetFormState();
								onCancel?.();
							}}
						>
							Cancel
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default TagModelForm;
