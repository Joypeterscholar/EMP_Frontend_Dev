/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import AccordionWrapper from "../pages/AccordionWrapper";
import {
	customFetch,
	filterDataByDateAndTimeRange,
	formatDate,
} from "../utils";
import { toast } from "react-toastify";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { InputLabel, MenuItem, Select } from "@mui/material";
import FormInput from "./FormInput";
import TagModelForm from "./TagModelForm";
import ObjectGroups from "./ObjectGroups";

const ModelRightPanel = ({
	mobile,
	setMobile,
	activePane,
	setActivePane,
	tagType,
	tagsData,
	setTagsData,
	model,
	searchApplied,
	setSearchApplied,
	newTaggedInfoName,
	setNewTaggedInfoName,
	handleFilterTags,
	resetTagsData,
	startDate,
	setStartDate,
	startTime,
	setStartTime,
	endDate,
	setEndDate,
	endTime,
	setEndTime,
	filterApplied,
	setFilterApplied,
	ReviewerState,
	setReviewerState,
	typeChoosed,
	setTypeChoosed,
	sampleChoosed,
	setSampleChoosed,
	incidentChoosed,
	setIncidentChoosed,
	resultChoosed,
	setResultChoosed,
	exportToCsv,
	exportData,
	fileExported,
	setFileExported,
	currentUser,
	promptDelete,
	objectGroups,
	setObjectGroups,
	fetchObjectGroups,
	modelId,
}) => {
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
	};

	return (
		<>
			{/* All information wrapper start */}
			<div className={mobile ? "alldataWrapperMobile" : "alldataWrapper"}>
				<div className="dataWrapper">
					<div>
						<div className="flex justify-between items-baseline px-2 py-2">
							<div className="w-full flex flex-col gap-2 align-center justify-center border-b border-gray-400">
								<h3
									className={`cursor-pointer font-bold ${
										activePane === "view-tags" &&
										"bg-green-500 rounded-t-md text-white"
									}`}
									onClick={() => setActivePane("view-tags")}
								>
									view tags
								</h3>
								{["sample", "incident"].includes(tagType) && (
									<h3
										className={`cursor-pointer font-bold ${
											activePane === "tag-model" &&
											"bg-green-500 rounded-t-md text-white"
										}`}
										onClick={() => setActivePane("tag-model")}
									>
										tag facility section
									</h3>
								)}
								<h3
									className={`cursor-pointer font-bold ${
										activePane === "object-groups" &&
										"bg-green-500 rounded-t-md text-white"
									}`}
									onClick={() => setActivePane("object-groups")}
								>
									Object Groups
								</h3>
								<div className="mt-1"></div>
							</div>
							<div className="menuWrapper">
								<div
									className="menu h-10 w-10 cursor-pointer"
									onClick={() => setMobile(!mobile)}
								>
									<MenuIcon />
								</div>
							</div>
						</div>

						{/* View Tags Pane */}
						{activePane === "view-tags" && (
							<div className="dataHistoryWrapper">
								{/* header */}
								<div className="px-2 header">
									<h1 className="text-2xl font-medium">Tag History</h1>
								</div>
								{/* header end */}

								{/* input */}
								<div className="h-14 AllModels">
									<div className="searchBarContainer">
										<div className="searchIconWrapper">
											<div
												className="img searchImg"
												onClick={() => {
													setSearchApplied(false);
													resetTagsData();
												}}
											>
												{searchApplied !== true ? (
													<img
														className="m-2 ml-3 w-[20px]"
														src="/img/search (2).png"
														alt="icon"
													/>
												) : (
													<CloseIcon />
												)}
											</div>
										</div>
										<input
											className="h-14 bg-[#585858]"
											type="text"
											name="search"
											value={newTaggedInfoName}
											placeholder="Search"
											onChange={(e) => {
												handleFilterTags(e.target.value);
												setNewTaggedInfoName(e.target.value);
												setSearchApplied(true);
											}}
										/>
										{filterApplied ? (
											<div className="filter" onClick={ClearFilter}>
												<div className="clear">clear</div>
											</div>
										) : (
											<div className="filter" onClick={AddFilter}>
												<div className="img">
													<img
														src="/img/Group 27014.png"
														alt="image"
													/>
												</div>
											</div>
										)}
									</div>
								</div>
								{/* input end */}

								{filterApplied && (
									<div className="appliedFilterWrapper">
										<div className="appliedFilterContainer">
											<div className="fromWrapper">
												<h3>From</h3>
												<div className="rounded-md wrapper">
													<CalendarTodayOutlinedIcon
														fontSize="small"
														className="date"
													/>
													<p className="break-words text-[10px] leading-tight">
														{formatDate(startDate)}
													</p>
												</div>
												<div className="rounded-md wrapper">
													<AccessTimeIcon
														className="time"
														fontSize="small"
													/>
													<p className="break-words text-[10px] leading-tight">
														{startTime ?? "00:00"}
													</p>
												</div>
											</div>
											<div className="toWrapper">
												<h3>to</h3>
												<div className="rounded-md wrapper">
													<CalendarTodayOutlinedIcon
														fontSize="small"
														className="date"
													/>
													<p className="break-words text-[10px] leading-tight">
														{formatDate(endDate)}
													</p>
												</div>
												<div className="rounded-md wrapper">
													<AccessTimeIcon
														className="time"
														fontSize="small"
													/>
													<p className="break-words text-[10px] leading-tight">
														{endTime ?? "24:00"}
													</p>
												</div>
											</div>
										</div>
										<button
											className="cancelFilter"
											onClick={() => {
												setFilterApplied(false);
												resetTagsData();
											}}
										>
											<CancelOutlinedIcon fontSize="small" />
											<p>Cancel filter</p>
										</button>
									</div>
								)}

								{/* all info container */}
								{ReviewerState === "allReviewer" && (
									<div className="flex flex-col gap-4 justify-start items-center mx-auto w-full">
										<div className="flex flex-col justify-start w-full">
											{/* accordion start */}
											<AccordionWrapper
												data={tagsData}
												setTagsData={setTagsData}
												model={model}
											/>
											{/* accordion end */}
										</div>
										<div
											className="w-full btnContainer"
											onClick={() => exportToCsv()}
										>
											<button className="w-full">Export Data</button>
										</div>
										{["admin", "superAdmin", "tagger"].includes(
											currentUser.role
										) && (
											<div className="w-full btnContainer">
												<button
													className="w-full"
													style={{ background: "#6e0101" }}
													onClick={promptDelete}
												>
													Delete All Samples
												</button>
											</div>
										)}
									</div>
								)}
								{/* all info container end*/}

								{/* filter card */}
								{ReviewerState === "filter" && (
									<div className="w-full filterCard">
										<div className="flex flex-row justify-center items-center my-auto w-full h-10 heading">
											<p className="">Static Period</p>
										</div>
										<div className="filterInputContainer max-w-[92%]">
											<div className="fromWrapper">
												<h3>From</h3>
												<div className="inputContainer">
													<input
														className="text-sm"
														value={startDate}
														type="date"
														onChange={(e) =>
															setStartDate(e.target.value)
														}
													/>
													<input
														type="time"
														value={startTime}
														className="text-sm"
														onChange={(e) =>
															setStartTime(e.target.value)
														}
													/>
												</div>
											</div>
											<div className="fromWrapper">
												<h3>To</h3>
												<div className="inputContainer">
													<input
														type="date"
														value={endDate}
														color="white"
														className="text-sm"
														onChange={(e) =>
															setEndDate(e.target.value)
														}
													/>
													<input
														type="time"
														value={endTime}
														onChange={(e) =>
															setEndTime(e.target.value)
														}
														className="text-sm"
													/>
												</div>
											</div>
											{!["sample", "incident"].includes(tagType) && (
												<div className="fromWrapper">
													<div className="w-full form-control">
														<InputLabel
															className="w-full label"
															id="demo-simple-select-label"
														>
															Filter by Type
														</InputLabel>
														<select
															value={typeChoosed}
															onChange={(e) =>
																setTypeChoosed(e.target.value)
															}
															name="type"
															required
															className="w-full p-2 border rounded"
														>
															<option value="" disabled>
																Select Type
															</option>
															{[
																{
																	value: "incident",
																	label: "Incident",
																},
																{
																	value: "sampling",
																	label: "Sampling",
																},
															].map((item) => (
																<option
																	key={item.value}
																	value={item.value}
																>
																	{item.label}
																</option>
															))}
														</select>
													</div>
												</div>
											)}
											{(typeChoosed === "incident" ||
												tagType === "incident") && (
												<div className="fromWrapper">
													<div className="w-full form-control">
														<InputLabel
															className="w-full label"
															id="demo-simple-select-label"
														>
															Filter by Incident
														</InputLabel>
														<FormInput
															onChange={(e) =>
																setIncidentChoosed(
																	e.target.value
																)
															}
															label="Incident"
															type="text"
															name="incident"
															placeholder="Incident"
															size="input-sm"
															value={incidentChoosed}
															options={[
																"Safety",
																"Crack",
																"Spill",
															]}
														/>
													</div>
												</div>
											)}
											{(typeChoosed === "sampling" ||
												tagType === "sample") && (
												<div className="fromWrapper">
													<div className="w-full form-control">
														<InputLabel
															className="w-full label"
															id="demo-simple-select-label"
														>
															Filter by sample
														</InputLabel>
														<FormInput
															onChange={(e) =>
																setSampleChoosed(e.target.value)
															}
															label="Type of sample"
															type="text"
															name="sample"
															placeholder="Please enter the type of sample"
															size="input-sm"
															value={sampleChoosed}
															options={[
																"Salmonella",
																"Listeria",
															]}
														/>
													</div>
												</div>
											)}

											{(typeChoosed === "sampling" ||
												tagType === "sample") && (
												<div className="fromWrapper">
													<div className="form-control">
														<InputLabel
															className="w-full label"
															id="demo-simple-select-label"
														>
															Filter by results
														</InputLabel>
														<Select
															className="w-full h-10 border shadow-none input input-bordered"
															labelId="demo-simple-select-label"
															id="demo-simple-select-label"
															value={resultChoosed}
															onChange={(e) =>
																setResultChoosed(e.target.value)
															}
															autoWidth
															name="results"
															label="results"
														>
															<MenuItem
																className="w-full"
																value={"positive"}
															>
																Positive
															</MenuItem>
															<MenuItem
																className="w-full"
																value={"negative"}
															>
																Negative
															</MenuItem>
														</Select>
													</div>
												</div>
											)}
											<div className="controlBtn">
												<button
													className="cancel"
													onClick={ClearFilter}
												>
													Cancel
												</button>
												<button
													className="apply"
													onClick={ApplyFilterButton}
												>
													Apply
												</button>
											</div>
										</div>
									</div>
								)}
								{/* filter end */}
							</div>
						)}

						{/* Tag Model Pane */}
						{activePane === "tag-model" && (
							<TagModelForm
								model={model}
								setTagsData={setTagsData}
								tagsData={tagsData}
								tagType={tagType}
								onCancel={() => setActivePane("view-tags")}
								objectGroups={objectGroups}
							/>
						)}

						{/* Object Groups Pane */}
						{activePane === "object-groups" && (
							<ObjectGroups
								objectGroups={objectGroups}
								setObjectGroups={setObjectGroups}
								modelId={modelId}
								fetchObjectGroups={fetchObjectGroups}
							/>
						)}
					</div>
				</div>
			</div>
			{/* All information wrapper end */}

			{/* export data container */}
			{exportData && (
				<div className="confirmationModalWrapper">
					<div className="confirmationModal">
						<div className="cancel" onClick={CancelExport}>
							<CancelOutlinedIcon fontSize="large" />
						</div>
						{/* for export controlls */}
						{fileExported ? (
							<div className="exportSuccessful">
								<div className="wrapper">
									<div className="img">
										<img src="/img/Group 215.png" alt="" />
									</div>
									<h1>export successfully</h1>
								</div>
							</div>
						) : (
							<div className="exportWrapper">
								<div className="btnWrapper">
									<button
										onClick={() => {
											setFileExported(true);
											exportToCsv();
										}}
										className=""
									>
										<div className="menu">
											<VideocamOutlinedIcon fontSize="large" />
										</div>
										<p>Export Data To CSV</p>
									</button>
								</div>
							</div>
						)}
						{/* for export successful */}
					</div>
				</div>
			)}
			{/*export data end */}
		</>
	);
};

export default ModelRightPanel;
