/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { useLoaderData, useNavigate } from "react-router-dom";
import "../styles/singleModel.css";

import { FormInput, SectionTitle } from "../components";
import { CiCirclePlus } from "react-icons/ci";
import { useSelector } from "react-redux";
// import { memoize } from 'proxy-memoize';
import { customFetch, getRandomArbitrary } from "../utils";
import { toast } from "react-toastify";
import {
	Button,
	InputLabel,
	MenuItem,
	Select,
	Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddSample from "./AddSample";
import { useQueryClient } from "@tanstack/react-query";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";
import { MdOutlineCancel } from "react-icons/md";
import AddIncident from "./AddIncident";

const AddModelSample = ({ showModal, setShowModal, model_data }) => {
	const [samples, setSamples] = useState([]);
	const [incidents, setIncidents] = useState([]);
	const [newTaggedInfoPosition, setNewTaggedInfoPosition] = useState();
	const [addIncident, setAddIncident] = useState(false);
	const [addSample, setAddSample] = useState(false);
	const [newTaggedInfoName, setNewTaggedInfoName] = useState();
	const [customData, setCustomData] = useState(false);
	const [evidenceName, setEvidenceName] = useState("");
	const queryClient = useQueryClient();
	const closeModal = () => {
		setShowModal(!showModal);
	};

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
		if (model_data.taggedInfo) {
			adjustTagPosition(model_data.taggedInfo);
		}
	}, [model_data]);

	const adjustTagPosition = (taggedInfo) => {
		const { meshName, tagPosition } = JSON.parse(taggedInfo);
		const tagPositionData = JSON.parse(tagPosition);
		// const newMeshPosition = JSON.stringify({...tagPositionData, _z:tagPositionData._z + getRandomArbitrary(0.0001, 0.1) });
		const newMeshPosition = JSON.stringify(tagPositionData);
		const tnewTaggedInfoPosition = JSON.stringify({
			meshName,
			newMeshPosition,
		});
		setNewTaggedInfoPosition(tnewTaggedInfoPosition);
	};

	const user = useSelector((state) => state.userState.user);
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser || user;
	const [isSubmitting, setIsSubmitting] = useState(false);

	// eslint-disable-next-line no-unused-vars
	const [formData, setFormData] = useState({
		fullname: currentUser.fullname,
		incident: "",
		evidence: "",
		action: "",
		locations: "",
		presence: "",
		sample: "",
		user: currentUser?._id,
		model: model_data.modelId,
		text: "",
		objectName: model_data.objectName,
		taggedInfo: model_data.taggedInfo,
		type: "",
	});

	const handleInputChange = (e) => {
		const { name, value, files } = e.target;
		if (name === "evidence") {
			setEvidenceName(files[0].name);
		}
		setFormData({
			...formData,
			[name]: files ? files[0] : value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!newTaggedInfoPosition) {
			toast.error("An Error Occured, Please restart the process again");
			return;
		}
		if (!formData.type) {
			toast.error("A Type is required");
		}

		if (formData.type === "sample" && !formData.presence) {
			toast.error("A Result is required");
		}
		setIsSubmitting(true);
		try {
			const formDataForUpload = new FormData();
			formDataForUpload.append("fullname", formData.fullname);
			formDataForUpload.append("incident", formData.incident);
			formDataForUpload.append("objectName", model_data?.objectName);
			formDataForUpload.append("type", formData.type);
			formDataForUpload.append("evidence", formData.evidence);
			formDataForUpload.append("action", formData.action);
			formDataForUpload.append("locations", formData.locations);
			formDataForUpload.append("sample", formData.sample);
			formDataForUpload.append("presence", formData.presence);
			formDataForUpload.append("text", formData.text);
			formDataForUpload.append("taggedInfo", model_data.taggedInfo);
			formDataForUpload.append("userId", currentUser?._id);
			formDataForUpload.append("modelId", model_data?.modelId);

			const response = await customFetch.post("/tag/add", formDataForUpload);
			queryClient.invalidateQueries("singleModel");

			if (response.data?.status !== "error") {
				toast.success(`Tag added successfully`);
				setFormData(formData);
			} else {
				toast.error(response.data?.message);
			}
			setFormData({
				fullname: currentUser?.fullname,
				incident: "",
				evidence: "",
				type: "",
				action: "",
				locations: "",
				presence: "",
				sample: "",
				user: currentUser?._id,
				model: model_data.model,
				text: "",
				objectName: model_data.objectName,
				taggedInfo: model_data.taggedInfo,
			});
			setEvidenceName("");
		} catch (error) {
			const errorMessage = error?.response?.data?.msg || "Error adding Tag";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};
	return (
		<>
			{showModal && (
				<div className="flex fixed inset-0 justify-center items-center py-4 bg-gray-800 bg-opacity-50">
					<div className="card relative flex w-auto h-[100%] flex-grow flex-col justify-start gap-4 bg-base-100 p-4 overflow-scroll">
						<div className="absolute top-5 right-5" onClick={closeModal}>
							<MdOutlineCancel className="w-5 h-5" />
						</div>
						<div className="flex flex-col justify-center items-center w-full">
							<div className="flex flex-col items-center p-4">
								<img
									src={model_data?.image}
									alt="Something wrong with Image attached"
									className="w-[450px] h-[450px] aspect-square rounded-lg"
								/>
								{/* header */}
								<div className="p-2 header">
									<SectionTitle text="Add Sample | Incident" />
								</div>
								{/* header end */}

								<form
									onSubmit={handleSubmit}
									method="POST"
									encType="multipart/form-data"
									className="flex flex-grow gap-5 justify-between items-center w-full h-auto"
								>
									<div className="flex flex-col flex-wrap gap-5 justify-center items-start w-full sm:flex-row">
										<div className="sm:w-[400px] min-h-[60px] w-full">
											<FormInput
												onChange={(e) => {
													handleInputChange(e);
													setNewTaggedInfoName(e.target.value);
												}}
												label="Object Name"
												type="text"
												name="objectName"
												placeholder="Object Name"
												size="full"
												value={model_data?.objectName}
											/>
										</div>
										<div className="sm:w-[400px] min-h-[60px] w-full">
											<FormInput
												onChange={handleInputChange}
												label="Location"
												type="text"
												name="locations"
												placeholder="Please type location"
												size="full"
												value={formData.locations}
											/>
										</div>
										<div className="sm:w-[400px] min-h-[60px] w-full">
											<div className="form-control">
												<InputLabel
													className="w-full label"
													id="demo-simple-select-label"
													title="can't find sample click the + icon to add it"
												>
													Type
												</InputLabel>
												<Select
													className="w-full h-11 border shadow-none"
													labelId="demo-simple-select-label"
													id="demo-simple-select-label"
													value={formData?.type}
													onChange={handleInputChange}
													autoWidth
													required
													name="type"
													label="Type"
												>
													<MenuItem
														className="w-full"
														value={"incident"}
													>
														Incident
													</MenuItem>
													<MenuItem
														className="w-full"
														value={"sampling"}
													>
														Sampling
													</MenuItem>
												</Select>
											</div>
										</div>
										{formData?.type === "sampling" && (
											<div className="sm:w-[400px] min-h-[60px] w-full">
												<div className="form-control">
													<InputLabel
														className="w-full label"
														id="demo-simple-select-label"
														title="can't find sample click the + icon to add it"
													>
														Type of Sample
														<span
															onClick={() => {
																setAddSample(!addSample);
															}}
															title="click to add new sample"
														>
															<AddIcon />
														</span>
													</InputLabel>
													<Select
														className="w-full h-10 border shadow-none input input-bordered"
														labelId="demo-simple-select-label"
														id="demo-simple-select-label"
														value={formData?.sample}
														onChange={handleInputChange}
														autoWidth
														name="sample"
														label="Type of Sample"
													>
														{Array.isArray(samples) &&
															samples.map((items, index) => (
																<MenuItem
																	className="w-full"
																	key={index}
																	value={items.value}
																>
																	{items.label}
																</MenuItem>
															))}
													</Select>
												</div>
											</div>
										)}
										{formData?.type === "incident" && (
											<div className="sm:w-[400px] min-h-[60px] w-full">
												<div className="form-control">
													<InputLabel
														className="w-full label"
														id="demo-simple-select-label-incident"
														title="can't find sample click the + icon to add it"
													>
														Incident
														<span
															onClick={() => {
																setAddIncident(!addIncident);
															}}
															title="click to add new incident"
														>
															<AddIcon />
														</span>
													</InputLabel>
													<Select
														className="w-full h-10 border shadow-none input input-bordered"
														labelId="demo-simple-select-label-incident"
														id="demo-simple-select-label-incident"
														value={formData?.incident}
														onChange={handleInputChange}
														autoWidth
														name="incident"
														label="Incident"
													>
														{Array.isArray(incidents) &&
															incidents.map((items, index) => (
																<MenuItem
																	className="w-full"
																	key={index}
																	value={items.value}
																>
																	{items.label}
																</MenuItem>
															))}
													</Select>
												</div>
											</div>
										)}
										{formData?.type === "sampling" && (
											<div className="sm:w-[400px] min-h-[60px] w-full">
												<div className="form-control">
													<InputLabel
														className="w-full label"
														id="demo-simple-select-label"
													>
														Result
													</InputLabel>
													<Select
														className="w-full h-10 border shadow-none input input-bordered"
														labelId="demo-simple-select-label"
														id="demo-simple-select"
														value={formData?.presence}
														onChange={handleInputChange}
														autoWidth
														required={
															formData?.type === "sampling"
														}
														name="presence"
														label="Sample Presence"
													>
														<MenuItem
															className="w-full"
															value="positive"
														>
															positive
														</MenuItem>
														<MenuItem
															className="w-full"
															value="negative"
														>
															negative
														</MenuItem>
													</Select>
												</div>
											</div>
										)}
										{["sampling", "incident"].includes(
											formData.type
										) && (
											<div className="sm:w-[400px] min-h-[60px] w-full">
												<FormInput
													onChange={handleInputChange}
													label="Corrective Actions"
													placeholder="Corrective Actions"
													type="text"
													name="action"
													value={formData?.action}
												/>
											</div>
										)}
										<div className="sm:w-[400px] min-h-[60px] w-full">
											<div className="flex flex-col">
												<p></p>
												<div className="flex flex-col gap-3 justify-center items-center mt-9 w-full border-1 input input-sm input-bordered min-h-10">
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
											</div>

											{customData && (
												<div className="flex flex-col mt-5 w-full h-auto">
													<textarea
														className="w-full h-auto rounded-md border"
														rows={4}
														cols={10}
														onChange={handleInputChange}
														label="text"
														placeholder="Please enter addition data here"
														type="text"
														name="text"
														size="input-sm"
														value={formData?.text}
													/>
												</div>
											)}
										</div>
										<div className="sm:w-[400px] min-h-[60px] w-full">
											<div className="form-control">
												<label htmlFor="evidence" className="label">
													<span className="capitalize label-text">
														Evidence
													</span>
												</label>
												<input
													type="file"
													name="evidence"
													accept=".jpg, .jpeg, .png, .webp"
													onChange={handleInputChange}
													placeholder={
														evidenceName || "File upload"
													}
													className={`w-full h-10 input input-bordered`}
												/>
											</div>
										</div>

										<div className="flex gap-4 justify-center items-center py-1 w-full">
											<Button
												className="h-10 border-solid btn btn-neutral"
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
												className="h-10 border-solid btn btn-outline btn-neutral btn-sm"
												onClick={() => setFormData(formData)}
											>
												Cancel
											</Button>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
					<AddSample showModal={addSample} setShowModal={setAddSample} />
					<AddIncident
						showModal={addIncident}
						setShowModal={setAddIncident}
					/>
				</div>
			)}
		</>
	);
};

export default AddModelSample;
