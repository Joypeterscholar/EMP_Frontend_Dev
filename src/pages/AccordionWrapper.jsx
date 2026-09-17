/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import "../styles/AccordionWrapper.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import { Box } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { customFetch, formatDate, formatTime } from "../utils";
import { toast } from "react-toastify";
import EvidenceImage from "./EvidenceImage";
import { resetCameraLocation } from "../components/SceneComponent";
import { useSelector } from "react-redux";
import { getUserFromLocalStorage } from "@/redux/reducers/userReducer";

const AccordionWrapper = ({ data, setTagsData, model }) => {
	const [expanded, setExpanded] = useState("");
	const [open, setOpen] = React.useState(false);
	const handleChange = (panel) => (event, isExpanded) => {
		setExpanded(isExpanded ? panel : "");
	};

	const user = useSelector((state) => state.userState.user);
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser || user;

	const handleOpen = (e) => {
		e.preventDefault(), setOpen(true);
	};

	const handleDelete = async (id) => {
		const response = await customFetch.delete(`/tag/tags-delete/${id}`);
		if (response.data.status !== "error") {
			toast.success(response.data.message || "Samples deleted successfully");
			let tags = model.tags?.filter((tag) => tag._id !== id);
			setTagsData(tags || []);
			model.tags = tags;
		} else {
			toast.error(response.data.message);
		}
	};

	return (
		<Box className="flex flex-col flex-grow gap-2 justify-start items-center py-4 mx-auto w-full Accordionn">
			{data?.map((item, index) => {
				const { _id: id } = item;
				return (
					<Accordion
						key={index}
						className={`accordionWrapper border-solid border-2 w-full ${
							item?.type === "sampling"
								? "border-red-900"
								: item?.type === "incident"
								? "border-blue-900"
								: "border-gray-300"
						}`}
						expanded={expanded === id}
						onChange={handleChange(id)}
					>
						<AccordionSummary
							className={`${
								expanded === id
									? "bg-black text-white rounded-t-[15px]"
									: ""
							}`}
							expandIcon={
								expanded === id ? (
									<ArrowCircleUpIcon className="text-white" />
								) : (
									<ArrowCircleUpIcon />
								)
							}
							aria-controls="panel1bh-content"
							id="panel1bh-header"
						>
							<Box className="heading">
								<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
									<p className="text-sm capitalize truncate">
										{item?.type === "sampling"
											? "Sample"
											: item?.type === "incident"
											? "Incident"
											: "Tag"}{" "}
										Added By {item?.user?.username}
									</p>
								</Box>
							</Box>
						</AccordionSummary>
						<AccordionDetails className="flex-grow details">
							<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
								<Typography className="text-sm">
									Created By:{" "}
								</Typography>
								<Typography className="text-sm">
									{item?.user?.username}
								</Typography>
							</Box>
							<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
								<Typography className="text-sm">Date: </Typography>
								<Typography className="text-sm">
									{formatDate(item?.createdAt)}
								</Typography>
							</Box>
							<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
								<Typography className="text-sm">Time: </Typography>
								<Typography className="text-sm">
									{formatTime(item?.createdAt)}
								</Typography>
							</Box>
							<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
								<Typography className="text-sm">
									Object Name:{" "}
								</Typography>
								<Typography className="text-sm">
									{item?.objectName}
								</Typography>
							</Box>
							<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
								<Typography className="text-sm">Group: </Typography>
								<Typography className="text-sm">
									{item?.group || ""}
								</Typography>
							</Box>
							<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
								<Typography className="text-sm">Ref: </Typography>
								<Typography className="text-sm">
									{item?.slug}
								</Typography>
							</Box>
							<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
								<Typography className="text-sm">Location: </Typography>
								<Typography className="text-sm">
									{item?.locations}
								</Typography>
							</Box>
							<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
								<Typography className="text-sm">Zone: </Typography>
								<Typography className="text-sm">
									{item?.zone || ""}
								</Typography>
							</Box>
							<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
								<Typography className="text-sm">Detail: </Typography>
								<Typography className="text-sm">
									{item?.sampleDetails || ""}
								</Typography>
							</Box>
							{item?.type === "sampling" && item?.sample?.name && (
								<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
									<Typography className="text-sm">
										Type of sample:{" "}
									</Typography>
									<Typography className="text-sm">
										{item?.sample?.name}
									</Typography>
								</Box>
							)}
							{item?.type === "incident" && item?.incident?.name && (
								<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
									<Typography className="text-sm">
										Incident:{" "}
									</Typography>
									<Typography className="text-sm">
										{item?.incident?.name}
									</Typography>
								</Box>
							)}
							{item?.type === "sampling" && item?.sample?.name && (
								<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
									<Typography className="text-sm">Result: </Typography>
									<Typography className="text-sm">
										{item?.presence}
									</Typography>
								</Box>
							)}
							<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
								<Typography className="text-sm">Evidence: </Typography>
								<a
									href={item?.evidence}
									onClick={handleOpen}
									className="cursor-pointer"
								>
									<Typography className="text-sm text-blue-300 underline">
										Evidence
									</Typography>
								</a>
							</Box>
							{["sampling", "incident"].includes(item.type) && (
								<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
									<Typography className="text-sm">
										Corrective Action:{" "}
									</Typography>
									<Typography className="text-sm">
										{item?.action ?? "None"}
									</Typography>
								</Box>
							)}
							<Box className="flex flex-row flex-nowrap gap-2 justify-start items-center info">
								<Typography className="text-sm">Note: </Typography>
								<Typography className="max-w-[350px] text-wrap text-sm">
									{item?.text}
								</Typography>
							</Box>
							<Box
								className="flex flex-row flex-nowrap gap-2 justify-start items-center info bg-blue-500 text-white font-bold py-2 px-4 rounded cursor-pointer"
								onClick={() => resetCameraLocation(item.taggedInfo)}
							>
								<Typography className="text-sm">
									Go to tag location{" "}
								</Typography>
							</Box>
							{["admin", "superAdmin", "tagger"].includes(
								currentUser.role
							) ? (
								<Box className="flex gap-2 justify-end items-center info">
									<div
										className="cursor-pointer hover:text-slate-400"
										onClick={() => handleDelete(id)}
									>
										<DeleteForeverIcon className="cursor-pointer hover:text-slate-400" />
									</div>
								</Box>
							) : null}
							<EvidenceImage
								showModal={open}
								setShowModal={setOpen}
								images={item?.evidence || ""}
								name={item?.objectName}
							/>
						</AccordionDetails>
					</Accordion>
				);
			})}
		</Box>
	);
};

export default AccordionWrapper;
