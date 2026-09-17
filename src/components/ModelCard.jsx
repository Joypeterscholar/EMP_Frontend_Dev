// components/ModelCard.jsx
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { List, Shield, Edit, ChevronUp, Eye } from "lucide-react";
import WebIcon from "./custom/WebIcons";
import { useNavigate, Link } from "react-router-dom";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getRealFileUrl } from "../utils";
import { deleteFromDb } from "./SceneComponent";
import { useSelector } from "react-redux";
import { getUserFromLocalStorage } from "@/redux/reducers/userReducer";

export const ModelCard = ({
	model,
	onDelete,
	onEdit,
	deleteModel,
	onCheck,
	userRole,
	isChecked = false,
}) => {
	const { _id, coverPicture, modelName, file } = model;

	const user = useSelector((state) => state.userState.user);
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser || user;
	const navigate = useNavigate();

	return (
		<Card
			onClick={(e) => {
				// In delete mode, suppress navigation from card clicks
				if (deleteModel) {
					e.preventDefault();
					e.stopPropagation();
					return;
				}
				navigate(`/view-model/${_id}`);
			}}
			className="group w-[356px] h-auto max-md:w-full overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-lg cursor-pointer"
		>
			{/* Image Container with improved styling */}
			<div className="relative w-[332px] h-[180px] mx-auto mt-4 overflow-hidden rounded-[12px]">
				{/* Eye indicator to show card is clickable */}
				<div className="absolute left-3 top-3 z-10 pointer-events-none">
					<div className="inline-flex items-center gap- 1 rounded-full bg-black/50 text-white px-2 py-1 text-[11px]">
						<Eye className="h-3.5 w-3.5" />
						<span>View</span>
					</div>
				</div>
				<div
					className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
					style={{
						backgroundImage: `url("${
							getRealFileUrl(coverPicture || "") ||
							"https://res.cloudinary.com/diqqf3eq2/image/upload/v1595959131/person-3_rxtqvi.jpg"
						}")`,
					}}
				/>

				{/* Delete Mode Checkbox */}
				{deleteModel && (
					<div className="absolute right-3 top-3 z-10">
						<input
							id={_id}
							checked={isChecked}
							onClick={(e) => {
								e.stopPropagation();
							}}
							onChange={(e) => {
								e.stopPropagation();
								onCheck(_id, e);
							}}
							type="checkbox"
							className="h-5 w-5 rounded-md border-2 border-white bg-white/20 backdrop-blur-sm accent-primary"
						/>
					</div>
				)}

				{/* Model Name moved outside per new layout */}
			</div>

			{/* Content Container */}
			<div className="space-y-4 p-4" onClick={(e) => e.stopPropagation()}>
				{/* Top Row: Model Name and Action Icons */}
				<div className="flex items-center justify-between">
					<h3 className="heading-medium font-semibold text-[#1F1F1F] truncate pr-2">
						{modelName}
					</h3>
					<div className="flex items-center">
						<Button
							variant="ghost"
							size="icon"
							className="hover:bg-slate-100"
							onClick={(e) => {
								e.stopPropagation();
								navigate(`/view-model/${_id}`);
							}}
						>
							<Eye className="h-6 w-6 text-primary" />
						</Button>
						{["admin", "superAdmin"].includes(currentUser.role) ? (
							<>
								<Button
									variant="ghost"
									size="icon"
									onClick={(e) => {
										e.stopPropagation();
										onEdit(_id);
									}}
									className="hover:bg-slate-100"
								>
									<Edit className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={(e) => {
										e.stopPropagation();
										onDelete(_id);
										deleteFromDb(getRealFileUrl(file)).then(
											console.log
										);
									}}
									className="hover:bg-slate-100"
								>
									<WebIcon icon="Trash" className="w-4 h-4" />
								</Button>
							</>
						) : null}
					</div>
				</div>

				{/* Bottom Row: Tag Count and View Button */}
				<div className="flex items-center justify-between">
					<span className="text-bold text-primary font-normal">
						{(model?.tags || []).length} Tags
					</span>
					<DropdownMenu>
						<DropdownMenuTrigger>
							<div className="flex items-center justify-center w-[207px] h-[48px] px-6 border-2 rounded-[20px] border-secondaryAlt2 text-secondaryAlt2 gap-2">
								<span className=" text-bold font-semibold">
									View Tag
								</span>
								<ChevronUp className="h-4 w-4 text-secondaryAlt2 -rotate-180" />
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-[200px] z-50 bg-white shadow-lg"
						>
							<DropdownMenuItem asChild>
								<Link
									to={`/view-model/${_id}?tagType=sample`}
									onClick={(e) => e.stopPropagation()}
									className="flex items-center gap-2 cursor-pointer hover:bg-[#021431] hover:text-white transition-colors"
								>
									<List className="h-4 w-4" />
									Sample
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link
									to={`/view-model/${_id}?tagType=incident`}
									onClick={(e) => e.stopPropagation()}
									className="flex items-center gap-2 cursor-pointer hover:bg-[#021431] hover:text-white transition-colors"
								>
									<Shield className="h-4 w-4" />
									Incident
								</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</Card>
	);
};
