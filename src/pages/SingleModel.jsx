/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import {
	Link,
	useLoaderData,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import "../styles/singleModel.css";
import AccordionWrapper from "./AccordionWrapper";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ModelViewBabylon from "../components/ModelViewBabylon";
import ModelOnScreenControls from "../components/ModelOnScreenControls";
import { useDispatch, useSelector } from "react-redux";
import { memoize } from "proxy-memoize";
import CloseIcon from "@mui/icons-material/Close";
import {
	customFetch,
	filterDataByDateAndTimeRange,
	formatDate,
	formatTime,
	removeCommas,
} from "../utils";
import { toast } from "react-toastify";
import { dispatchSelectedMeshTags } from "../redux/actions/meshActions";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import { toggleSetting } from "../redux/actions/settingActions";
import { InputLabel, MenuItem, Select } from "@mui/material";
import TagModelForm from "../components/TagModelForm";
import { FormInput } from "../components";
import ObjectGroups from "@/components/ObjectGroups";
import { getUserFromLocalStorage } from "@/redux/reducers/userReducer";
import ModelRightPanel from "../components/ModelRightPanel";

export const loader =
	() =>
	async ({ params }) => {
		const response = await customFetch(`/model/get-a-models/${params.id}`);
		if (response?.data.status === "error") {
			toast.error(response?.data.message);
		}
		return { model: response?.data?.data ?? {} };
	};

const SingleModel = () => {
	const { model } = useLoaderData();
	const { id } = useParams();
	const [sp] = useSearchParams();
	const tagType = sp.get("tagType");
	const dispatch = useDispatch();
	const setting = useSelector(memoize((state) => state.settingState.setting));
	const settingMode = () => {
		dispatch(toggleSetting(!setting));
	};

	const [searchApplied, setSearchApplied] = useState(false);
	const [startDate, setStartDate] = useState("");
	const [startTime, setStartTime] = useState("00:00");
	const [endDate, setEndDate] = useState("");
	const [endTime, setEndTime] = useState("24:00");
	const [mobile, setMobile] = useState(false);
	const [ReviewerState, setReviewerState] = useState("allReviewer");
	const [filterApplied, setFilterApplied] = useState(false);
	const [exportData, setExportData] = useState(false);
	const [fileExported, setFileExported] = useState(false);
	const [tagsData, setTagsData] = useState([]);
	const [newTaggedInfoName, setNewTaggedInfoName] = useState("");
	const [newTaggedInfoPosition, setNewTaggedInfoPosition] = useState("");
	const [newTaggedInfo, setNewTaggedInfo] = useState({});
	const [samples, setSamples] = useState([]);
	const [incidents, setIncidents] = useState([]);
	const [sampleChoosed, setSampleChoosed] = useState("");
	const [typeChoosed, setTypeChoosed] = useState("");
	const [incidentChoosed, setIncidentChoosed] = useState("");
	const [resultChoosed, setResultChoosed] = useState("");
	const [activePane, setActivePane] = useState("view-tags");
	const [objectGroups, setObjectGroups] = useState([]);
	const navigate = useNavigate();

	const user = useSelector((state) => state.userState.user);
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser || user;

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

	async function fetchObjectGroups() {
		await customFetch.get(`/model/${id}/object-group`).then(({ data }) => {
			if (data) {
				setObjectGroups(data);
			}
		});
	}

	useEffect(() => {
		fetchSamples();
		fetchIncidents();
		fetchObjectGroups();
	}, []);

	useEffect(() => {
		const tags = model?.tags;
		if (tags) {
			dispatch(dispatchSelectedMeshTags(tags));
		}
	}, [dispatch, model]);

	useEffect(() => {
		if (model?.tags) {
			if (tagType) {
				setTagsData(model.tags.filter((tag) => tag[tagType]));
				model.tags = model.tags.filter((tag) => tag[tagType]);
			} else {
				setTagsData(model.tags);
			}
		}
	}, []);

	const goBack = () => {
		navigate(-1);
	};
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
			// hack
			// setNewTaggedInfoName(modelInterationActiveData.objectName);
		}
		setNewTaggedInfoPosition(tagPosition);
		setNewTaggedInfo(modelInterationData);
	}, [modelInterationData, modelInterationActiveData]);

	function resetTagsData() {
		setTagsData(model?.tags);
	}

	const handleFilterTags = useCallback(
		(search) => {
			if (!search.length) {
				setTagsData(model.tags || []);
				return;
			}
			const regex = new RegExp(`.*${search.toLowerCase()}.*`, "i");

			const searchResult = (model.tags || []).filter((item) => {
				return (
					regex.test(item.objectName?.toLowerCase()) ||
					regex.test(item.incident?.toLowerCase()) ||
					regex.test(item.presence?.toLowerCase()) ||
					regex.test(item.sample?.toLowerCase()) ||
					regex.test(item.locations?.toLowerCase()) ||
					regex.test(item.text?.toLowerCase()) ||
					regex.test(item.type?.toLowerCase()) ||
					regex.test(item.slug?.toLowerCase()) ||
					regex.test(item.group?.toLowerCase())
				);
			});

			setTagsData(searchResult);
		},
		[tagsData, setTagsData]
	);

	function exportToCsv() {
		toast.success("Exporting data...");
		// Preprocess the data (formatting, etc.)
		var formattedRows = [];
		for (var i = 0; i < tagsData.length; i++) {
			var formattedRow = [];
			formattedRow.push(tagsData[i].objectName);
			formattedRow.push(tagsData[i].slug);
			formattedRow.push(tagsData[i].incident?.name);
			formattedRow.push(tagsData[i].evidence);
			formattedRow.push(tagsData[i].locations);
			formattedRow.push(tagsData[i].presence);
			formattedRow.push(tagsData[i].sample?.name);
			formattedRow.push(tagsData[i].user.username);
			formattedRow.push(model.modelName);
			formattedRow.push(tagsData[i].text);
			formattedRow.push(removeCommas(formatDate(tagsData[i].createdAt)));
			formattedRow.push(formatTime(tagsData[i].createdAt));
			formattedRows.push(formattedRow);
		}
		// Create CSV content
		var csvContent =
			"ObjectName,Ref,Actions,Evidence,Locations,Result,Type,Username,Model,Note,Date,Time\n"; // Adding header row

		// Add rows
		for (var j = 0; j < formattedRows.length; j++) {
			csvContent += formattedRows[j].join(",") + "\n";
		}

		// Create a Blob object with CSV content
		var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

		// Create a temporary URL for the Blob object
		var url = URL.createObjectURL(blob);

		// Create a link element
		var link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", model.name);

		// Append the link to the document body
		document.body.appendChild(link);
		// Trigger the click event on the link to initiate download
		link.click();

		// Clean up by revoking the temporary URL
		URL.revokeObjectURL(url);
		toast.success("Data exported Successfully");
	}

	const AddFilter = () => {
		setReviewerState("filter");
	};

	const ApplyFilterButton = async () => {
		setFilterApplied(true);
		setReviewerState("allReviewer");
		const result = await filterDataByDateAndTimeRange(
			model.tags || [],
			startDate,
			endDate,
			startTime,
			endTime
		);
		if (
			result.length &&
			(typeChoosed === "sampling" || tagType === "sample")
		) {
			if (sampleChoosed.length) {
				const filterResult = result.filter(
					(item) =>
						item?.sample?.toLowerCase() === sampleChoosed.toLowerCase() &&
						(item?.presence.toLowerCase() ===
							resultChoosed.toLowerCase() ||
							!resultChoosed)
				);
				setTagsData(filterResult);
			} else {
				toast.error("please choose sample type, aborting filter apply");
			}
		} else if (
			result.length &&
			(typeChoosed === "incident" || tagType == "incident")
		) {
			if (incidentChoosed.length) {
				const filterResult = result.filter(
					(item) =>
						item?.incident?.toLowerCase() ===
						incidentChoosed.toLowerCase()
				);
				setTagsData(filterResult);
			} else {
				toast.error("please choose incident type, aborting filter apply");
			}
		} else {
			setTagsData(result);
		}
	};

	const ClearFilter = () => {
		setFilterApplied(false);
		setReviewerState("allReviewer");
		resetTagsData();
	};

	const CancelExport = () => {
		setFileExported(false);
		setExportData(false);
		resetTagsData();
	};
	const promptDelete = () => {
		if (confirm("Are you sure you want delete all samples")) {
			handleDelete();
		}
	};

	const handleDelete = async () => {
		const response = await customFetch.delete(`/tag/delete-model-tags/${id}`);
		if (response.data.status !== "error") {
			toast.success(
				response.data.message || "All Samples deleted successfully"
			);
			model.tags = [];
			setTagsData([]);
		} else {
			toast.error(response.data.message);
		}
	};

	return (
		<div className="h-screen ReviewerDashBoardWraper">
			<div className="ReviewerDashBoard">
				{/*threejs animation wrapper start  */}
				<div className="h-screen threejsWrapper">
					<div className="w-screen h-screen threejsAnimationWrapper">
						<ModelViewBabylon
							MODEL_URL={model.file}
							tags={tagsData}
							model={model}
							setTagsData={setTagsData}
						/>
					</div>
					<div className="navigation">
						<div onClick={goBack}>
							<div className="cursor-pointer backContainer">
								<p>Back</p>
								<CancelOutlinedIcon fontSize="small" />
							</div>
						</div>
						<div className="flex flex-row gap-2 justify-end items-center">
							<div className="hidden w-10 h-10">
								<SettingsIcon
									className="text-white cursor-pointer"
									onClick={() => settingMode()}
								/>
							</div>
							{mobile ? (
								<div
									className="flex w-10 h-10 menu"
									onClick={() => setMobile(!mobile)}
								>
									<MenuIcon className="text-white cursor-pointer" />
								</div>
							) : (
								<div
									className="flex w-10 h-10 mobileMenu"
									onClick={() => setMobile(!mobile)}
								>
									<MenuIcon className="text-white cursor-pointer" />
								</div>
							)}
						</div>
					</div>
					<ModelOnScreenControls />
				</div>
				{/*threejs animation wrapper ends  */}

				{/* All information wrapper start */}
				<ModelRightPanel
					mobile={mobile}
					setMobile={setMobile}
					activePane={activePane}
					setActivePane={setActivePane}
					tagType={tagType}
					tagsData={tagsData}
					setTagsData={setTagsData}
					model={model}
					searchApplied={searchApplied}
					setSearchApplied={setSearchApplied}
					newTaggedInfoName={newTaggedInfoName}
					setNewTaggedInfoName={setNewTaggedInfoName}
					handleFilterTags={handleFilterTags}
					resetTagsData={resetTagsData}
					startDate={startDate}
					setStartDate={setStartDate}
					startTime={startTime}
					setStartTime={setStartTime}
					endDate={endDate}
					setEndDate={setEndDate}
					endTime={endTime}
					setEndTime={setEndTime}
					filterApplied={filterApplied}
					setFilterApplied={setFilterApplied}
					ReviewerState={ReviewerState}
					setReviewerState={setReviewerState}
					typeChoosed={typeChoosed}
					setTypeChoosed={setTypeChoosed}
					sampleChoosed={sampleChoosed}
					setSampleChoosed={setSampleChoosed}
					incidentChoosed={incidentChoosed}
					setIncidentChoosed={setIncidentChoosed}
					resultChoosed={resultChoosed}
					setResultChoosed={setResultChoosed}
					exportToCsv={exportToCsv}
					exportData={exportData}
					fileExported={fileExported}
					setFileExported={setFileExported}
					currentUser={currentUser}
					promptDelete={promptDelete}
					objectGroups={objectGroups}
					setObjectGroups={setObjectGroups}
					fetchObjectGroups={fetchObjectGroups}
					modelId={model._id}
				/>
			</div>
		</div>
	);
};

export default SingleModel;
