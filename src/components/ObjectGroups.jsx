import { memoize } from "proxy-memoize";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { resetCameraLocation } from "./SceneComponent";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import { customFetch } from "@/utils";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ObjectGroups({
	objectGroups,
	setObjectGroups,
	modelId,
	fetchObjectGroups,
}) {
	const [groupData, setGroupData] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchApplied, setSearchApplied] = useState(false);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [groupName, setGroupName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const modelInterationData = useSelector(
		memoize((state) => state.selectedMeshState.data)
	);

	const getClickedPointAndCameraData = (modelInterationData) => {
		if (modelInterationData) {
			const newTaggedinfo = JSON.parse(modelInterationData);
			return {
				position: newTaggedinfo?.tagPosition,
				cameraPosition: newTaggedinfo?.cameraPosition,
				cameraRotation: newTaggedinfo?.cameraRotation,
				cameraDirection: newTaggedinfo?.cameraDirection,
			};
		}
		return null;
	};

	useEffect(() => {
		const groupData = getClickedPointAndCameraData(modelInterationData);
		if (groupData) {
			setGroupData(groupData);
		}
	}, [modelInterationData]);

	const handleGoToLocation = (group) => {
		if (
			group?.cameraPosition &&
			group?.cameraDirection &&
			group?.cameraRotation
		) {
			resetCameraLocation(group);
		} else {
			toast.error("Camera data is missing for this group.");
		}
	};

	const handleDeleteGroup = async (group) => {
		try {
			const response = await customFetch.delete(
				`/model/${modelId}/object-group/${group._id}`
			);
			if (response.data.status !== "error") {
				toast.success("Group deleted successfully");
				fetchObjectGroups();
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to delete group");
		}
	};

	const handleSearchChange = (event) => {
		setSearchQuery(event.target.value);
		setSearchApplied(true);
	};

	const normalizedQuery = (searchQuery || "").trim().toLowerCase();
	const filteredGroups = (objectGroups || []).filter((group) => {
		const name = (group?.name || "").toString().trim().toLowerCase();
		return normalizedQuery.length === 0
			? true
			: name.includes(normalizedQuery);
	});

	const resetSearchData = () => {
		setSearchApplied(false);
		setSearchQuery("");
	};

	const handleCreateGroup = async (event) => {
		event.preventDefault();
		setIsSubmitting(true);
		if (!groupName) {
			toast.error("Group name is required");
			setIsSubmitting(false);
			return;
		}
		if (!groupData) {
			toast.error("Please click on an object to group");
			setIsSubmitting(false);
			return;
		}

		try {
			const response = await customFetch.post(
				`/model/${modelId}/object-group`,
				{
					name: groupName,
					...groupData,
				}
			);

			if (response?.data?.status !== "error") {
				toast.success("Group created successfully");
				setObjectGroups([...objectGroups, response.data.data]); // Update the list
				setGroupName("");
				setShowCreateForm(false);
				fetchObjectGroups();
			} else {
				toast.error(response?.data?.message || "Failed to create group");
			}
		} catch (error) {
			toast.error("Failed to create group");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="p-4 space-y-4">
			{/* Header */}
			<h2 className="text-xl font-semibold">Object Groups</h2>
			{/* Search and Create Section */}
			<div className="flex flex-col gap-4">
				{/* Create Group Form */}
				{showCreateForm ? (
					<form
						onSubmit={handleCreateGroup}
						className="flex flex-col gap-4"
					>
						<input
							type="text"
							placeholder="Group Name"
							list="group-names"
							value={groupName}
							onChange={(e) => setGroupName(e.target.value)}
							className="input input-bordered input-sm w-full"
							required
						/>
						<datalist id="group-names">
							{[...new Set(objectGroups.map((group) => group?.name))]
								.filter((name) => name)
								.map((name) => (
									<option key={name} value={name} />
								))}
						</datalist>
						<button
							type="submit"
							disabled={isSubmitting}
							className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition"
						>
							{isSubmitting ? "Creating..." : "Add Group"}
						</button>
						<button
							type="button"
							onClick={() => {
								setShowCreateForm(false);
								setIsSubmitting(false);
							}}
							className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
						>
							Cancel
						</button>
					</form>
				) : null}
				{/* Create Group Button */}
				{!showCreateForm ? (
					<div className="w-full">
						<button
							className="w-full rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 transition"
							onClick={() => setShowCreateForm(!showCreateForm)}
						>
							Create Group
						</button>
					</div>
				) : null}
				<div className="flex flex-col">
					{/* Search Input */}
					<input
						className="h-12 w-full rounded-lg border border-gray-500 bg-gray-700 text-white placeholder-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
						type="text"
						name="search"
						value={searchQuery}
						placeholder="Search..."
						onChange={handleSearchChange}
					/>
				</div>
			</div>
			{/* Group Tiles */}
			<div className="flex flex-col gap-4">
				{filteredGroups.length === 0 ? (
					<div className="rounded-lg border border-gray-300 p-3 text-gray-600 bg-gray-50">
						No groups match "{searchQuery}"
					</div>
				) : null}
				{filteredGroups.map((group, index) => (
					<div
						key={group?._id}
						className="rounded-lg border border-gray-300 p-2 shadow-md bg-gray-100 flex flex-row items-center justify-between w-full"
					>
						<h3 className="text-lg font-medium text-gray-800">
							{group?.name || "Unnamed Group"}
						</h3>
						<div className="ml-4 flex gap-2">
							<div>
								<button
									className="rounded-md  px-2 py-2 text-gray-600 hover:bg-gray-200 transition"
									onClick={() => handleGoToLocation(group)}
								>
									<VisibilityIcon />
								</button>
							</div>
							<div>
								<button
									className="rounded-md px-2 py-2 text-red-600 hover:bg-red-200 transition"
									onClick={() => handleDeleteGroup(group)}
								>
									<DeleteIcon />
								</button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
