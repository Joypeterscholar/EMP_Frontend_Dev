import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { memoize } from "proxy-memoize";
import { customFetch, formatDate, formatTime, getRealFileUrl } from "../utils";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";
import SearchInput from "../components/ui/search-input";
import { Button as ShButton } from "../components/ui/button";
import Modal from "../components/ui/modal";

const STATUS_OPTIONS = [
	{ label: "All Status", value: "all" },
	{ label: "Pending", value: "pending" },
	{ label: "Reviewed", value: "reviewed" },
	{ label: "Resolved", value: "resolved" },
];

const STATUS_STYLES = {
	pending: "text-amber-700 bg-amber-100",
	reviewed: "text-blue-700 bg-blue-100",
	resolved: "text-emerald-700 bg-emerald-100",
};

const ATTACHMENT_ACCEPT =
	".png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.doc,.docx,.mp4,.mov,.avi,.webm";

const Feedback = () => {
	const user = useSelector(memoize((state) => state.userState.user));
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser || user;
	const isSuperAdmin =
		currentUser &&
		(currentUser.role || "").toLowerCase() === "superadmin";

	const [feedbacks, setFeedbacks] = useState([]);
	const [summary, setSummary] = useState(null);
	const [statusFilter, setStatusFilter] = useState("all");
	const [searchText, setSearchText] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [attachment, setAttachment] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedFeedback, setSelectedFeedback] = useState(null);
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);

	const fetchFeedbacks = async (filter = statusFilter) => {
		if (!currentUser) {
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const params =
				filter && filter !== "all"
					? {
							params: {
								status: filter,
							},
					  }
					: {};
			const response = await customFetch.get("/feedback", params);
			if (response?.data?.status === "error") {
				toast.error(response.data.message || "Unable to fetch feedbacks");
				setFeedbacks([]);
				setSummary(null);
			} else {
				setFeedbacks(response?.data?.data || []);
				setSummary(response?.data?.summary || null);
			}
		} catch (error) {
			console.error("Error fetching feedbacks:", error);
			// Handle 404 and other errors gracefully
			if (error?.response?.status === 404) {
				toast.error("Feedback endpoint not found. Please ensure the backend is running.");
			} else {
				const errorMessage =
					error?.response?.data?.message || "Unable to fetch feedbacks";
				toast.error(errorMessage);
			}
			setFeedbacks([]);
			setSummary(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchFeedbacks();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [statusFilter]);

	const filteredFeedbacks = useMemo(() => {
		const term = searchText.trim().toLowerCase();
		if (!term) return feedbacks;
		return feedbacks.filter((item) => {
			const userLabel =
				`${item?.user?.fullname || ""} ${item?.user?.username || ""}`.toLowerCase();
			const message = (item?.message || "").toLowerCase();
			const status = (item?.status || "").toLowerCase();
			const createdAt = String(item?.createdAt || "").toLowerCase();
			return (
				userLabel.includes(term) ||
				message.includes(term) ||
				status.includes(term) ||
				createdAt.includes(term)
			);
		});
	}, [feedbacks, searchText]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!message.trim()) {
			toast.error("Please provide feedback");
			return;
		}
		setIsSubmitting(true);
		try {
			const formData = new FormData();
			formData.append("message", message.trim());
			if (attachment) {
				formData.append("attachment", attachment);
			}
			await customFetch.post("/feedback", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			toast.success("Feedback submitted");
			setMessage("");
			setAttachment(null);
			setShowFeedbackModal(false);
			fetchFeedbacks();
		} catch (error) {
			const errorMessage =
				error?.response?.data?.message || "Unable to submit feedback";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleStatusChange = async (id, status) => {
		if (!isSuperAdmin) return;
		try {
			await customFetch.patch(`/feedback/${id}/status`, { status });
			toast.success("Status updated");
			fetchFeedbacks();
		} catch (error) {
			const errorMessage =
				error?.response?.data?.message || "Unable to update status";
			toast.error(errorMessage);
		}
	};

	const isVideoAttachment = (attachmentObj) => {
		const mimeType = (attachmentObj?.mimetype || "").toLowerCase();
		if (mimeType.startsWith("video/")) {
			return true;
		}
		const fileIdentifier =
			attachmentObj?.filename || attachmentObj?.url || attachmentObj?.name || "";
		return /\.(mp4|mov|avi|webm|mkv)$/i.test(fileIdentifier);
	};

	const escapeHtml = (value = "") =>
		value
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");

	const openAttachmentInNewTab = (attachmentObj) => {
		if (!attachmentObj?.url) return;
		const url = getRealFileUrl(attachmentObj.url);

		if (!isVideoAttachment(attachmentObj)) {
			window.open(url, "_blank", "noopener,noreferrer");
			return;
		}

		const previewWindow = window.open("about:blank", "_blank");
		if (!previewWindow) {
			toast.error("Please allow pop-ups to preview the video.");
			return;
		}

		const title = escapeHtml(attachmentObj?.filename || "Video Preview");
		const safeUrl = encodeURI(url);

		try {
			previewWindow.document.open();
			previewWindow.document.write(`<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<title>${title}</title>
		<style>
			* { box-sizing: border-box; }
			body { margin: 0; background: #000; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; height: 100vh; }
			header { padding: 12px 16px; background: rgba(0,0,0,0.75); font-size: 14px; }
			video { flex: 1; width: 100%; height: 100%; background: #000; }
		</style>
	</head>
	<body>
		<header>${title}</header>
		<video controls autoplay src="${safeUrl}"></video>
	</body>
</html>`);
			previewWindow.document.close();
		} catch (err) {
			console.error("Unable to render preview window:", err);
			previewWindow.close();
			window.open(url, "_blank");
		} finally {
			if (previewWindow) {
				previewWindow.opener = null;
			}
		}
	};

	const StatCard = ({ label, value, accentClass }) => (
		<div
			className={`rounded-3xl border border-gray-100 bg-white px-6 py-4 min-w-[140px] shadow-sm ${accentClass}`}
		>
			<p className="text-sm text-gray-500 font-medium">{label}</p>
			<p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
		</div>
	);

	const AttachmentBadge = ({ attachment }) => {
		if (!attachment?.url) {
			return <span className="text-xs text-gray-400">No attachment</span>;
		}
		return (
			<button
				onClick={() => openAttachmentInNewTab(attachment)} 
				className="text-xs font-semibold text-primary underline"
			>
				Open file
			</button>
		);
	};

	// Safety check: ensure component always renders
	if (!currentUser) {
		return (
			<div className="flex flex-col flex-grow p-5 gap-6">
				<div className="flex flex-col gap-4">
					<h2 className="text-2xl font-bold text-primary">Feedback</h2>
					<p className="text-gray-500">Please log in to view feedback.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col flex-grow p-5 gap-6">
			<div className="flex flex-col gap-4 items-center text-center">
				<p className="text-gray-500">
					Share your thoughts, report issues, or review submitted feedback.
				</p>
			</div>

			{isSuperAdmin && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<StatCard
						label="Total Feedback"
						value={summary?.total ?? feedbacks.length}
						accentClass="border-purple-200"
					/>
					<StatCard
						label="Pending"
						value={summary?.pending ?? 0}
						accentClass="border-amber-200"
					/>
					<StatCard
						label="Reviewed"
						value={summary?.reviewed ?? 0}
						accentClass="border-blue-200"
					/>
					<StatCard
						label="Resolved"
						value={summary?.resolved ?? 0}
						accentClass="border-emerald-200"
					/>
				</div>
			)}

		{isSuperAdmin && (
			<div className="bg-white rounded-3xl shadow p-5 border border-gray-100">
					<div className="flex flex-wrap items-center gap-3 justify-between mb-4">
						<div className="flex flex-wrap items-center gap-3">
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
								className="border rounded-full px-4 py-2 text-sm bg-gray-50 focus:outline-none"
							>
								{STATUS_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
							<ShButton
								className="rounded-full cursor-pointer bg-primary text-white px-4 py-2"
								onClick={() => fetchFeedbacks()}
							>
								Refresh
							</ShButton>
							<ShButton
								className="rounded-full cursor-pointer bg-primary text-white px-4 py-2"
								onClick={() => setShowFeedbackModal(true)}
							>
								Add Feedback
							</ShButton>
						</div>
						<SearchInput
							value={searchText}
							onChange={setSearchText}
							placeholder="Search by user, note, status..."
						/>
					</div>
						<div className="overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead>
									<tr className="text-left text-gray-500 border-b">
										<th className="py-3 pr-3">User</th>
										<th className="py-3 pr-3">Message</th>
										<th className="py-3 pr-3">Attachments</th>
										<th className="py-3 pr-3">Status</th>
										<th className="py-3 pr-3">Date</th>
										<th className="py-3 pr-3 text-right">Actions</th>
									</tr>
								</thead>
								<tbody>
									{filteredFeedbacks.length === 0 && (
										<tr>
											<td
												colSpan="6"
												className="py-6 text-center text-gray-400"
											>
												{loading ? "Loading feedback..." : "No feedback found"}
											</td>
										</tr>
									)}
									{filteredFeedbacks.map((item) => (
										<tr key={item._id} className="border-b last:border-b-0">
											<td className="py-4 pr-3">
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold uppercase">
														{(item?.user?.fullname || item?.user?.username || "U")
															.substring(0, 1)}
													</div>
													<div>
														<p className="font-medium text-gray-900">
															{item?.user?.fullname || item?.user?.username || "User"}
														</p>
														<p className="text-xs text-gray-400">
															{item?.user?.role || "user"}
														</p>
													</div>
												</div>
											</td>
											<td className="py-4 pr-3 max-w-xs">
												<p className="line-clamp-2 text-gray-700">
													{item.message}
												</p>
											</td>
											<td className="py-4 pr-3">
												<AttachmentBadge attachment={item.attachment} />
											</td>
											<td className="py-4 pr-3">
												<span
													className={`px-3 py-1 rounded-full text-xs font-semibold ${
														STATUS_STYLES[item.status] || "bg-gray-100 text-gray-600"
													}`}
												>
													{item.status}
												</span>
											</td>
											<td className="py-4 pr-3 text-sm text-gray-500">
												<div>{formatDate(item.createdAt)}</div>
												<div className="text-xs">{formatTime(item.createdAt)}</div>
											</td>
											<td className="py-4 pr-0 text-right">
												<div className="flex items-center gap-2 justify-end">
													<button
														onClick={() => setSelectedFeedback(item)}
														className="text-primary font-semibold text-sm"
													>
														View
													</button>
													<select
														value={item.status}
														onChange={(e) =>
															handleStatusChange(item._id, e.target.value)
														}
														className="border rounded-full px-3 py-1 text-xs bg-gray-50 focus:outline-none"
													>
														{STATUS_OPTIONS.filter((opt) => opt.value !== "all").map(
															(option) => (
																<option key={option.value} value={option.value}>
																	{option.label}
																</option>
															)
														)}
													</select>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

			{/* Submit feedback form - only for non-superAdmin users */}
			{!isSuperAdmin && (
				<div className="flex justify-center">
					<div className="bg-white rounded-3xl shadow p-6 border border-gray-100 w-full max-w-2xl">
						<h3 className="text-xl font-semibold mb-2">Submit Feedback</h3>
						<p className="text-sm text-gray-500 mb-4">
							Tell us what you think. Share suggestions, report issues, or let us know
							what's working well.
						</p>
						<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
						<div>
							<label className="text-sm font-medium text-gray-700">
								Your Feedback
							</label>
							<textarea
								value={message}
								onChange={(e) => {
									const value = e.target.value.slice(0, 5000);
									setMessage(value);
								}}
								rows={6}
								placeholder="Share your thoughts, suggestions, or report issues..."
								className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
								required
							/>
							<div className="text-right text-xs text-gray-400">
								{message.length} / 5000
							</div>
						</div>
						<div>
							<label className="text-sm font-medium text-gray-700">
								Attachments (optional)
							</label>
							<div className="mt-2 border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center">
								<input
									type="file"
									accept={ATTACHMENT_ACCEPT}
									onChange={(e) => setAttachment(e.target.files?.[0] || null)}
									className="hidden"
									id="feedback-attachment"
								/>
								<label
									htmlFor="feedback-attachment"
									className="cursor-pointer text-primary font-semibold"
								>
									Click to upload files
								</label>
								<p className="text-xs text-gray-400 mt-1">
									Images (JPG, PNG, GIF, WEBP), video (MP4, MOV, AVI, WEBM), PDF or
									text files. Max 10MB.
								</p>
								{attachment && (
									<div className="mt-2 flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
										<span className="truncate">{attachment.name}</span>
										<button
											type="button"
											onClick={() => setAttachment(null)}
											className="text-red-500"
										>
											Remove
										</button>
									</div>
								)}
							</div>
						</div>
						<ShButton
							type="button"
							onClick={(e) => {
								e.preventDefault();
								handleSubmit(e);
							}}
							disabled={isSubmitting}
							className="rounded-2xl bg-primary text-white h-12 shadow-none hover:bg-secondaryAlt"
						>
						{isSubmitting ? "Submitting..." : "Submit Feedback"}
					</ShButton>
				</form>
			</div>
		</div>
		)}

		{!isSuperAdmin && feedbacks.length > 0 && (
			<div className=" w-full">
				<div className="bg-white rounded-3xl shadow p-5 border border-gray-100 w-full">
					<h3 className="text-lg font-semibold mb-4">Your submissions</h3>
					<div className="space-y-4">
						{feedbacks.map((item) => (
							<div
								key={item._id}
								className="border border-gray-100 rounded-2xl p-4 flex flex-col gap-2"
							>
								<div className="flex items-center justify-between">
									<span
										className={`px-3 py-1 rounded-full text-xs font-semibold ${
											STATUS_STYLES[item.status] || "bg-gray-100 text-gray-600"
										}`}
									>
										{item.status}
									</span>
									<div className="text-xs text-gray-400">
										{formatDate(item.createdAt)} - {formatTime(item.createdAt)}
									</div>
								</div>
								<p className="text-gray-700 text-sm">{item.message}</p>
								<AttachmentBadge attachment={item.attachment} />
							</div>
						))}
					</div>
				</div>
			</div>
		)}

			{/* Add Feedback Modal for SuperAdmin */}
			<Modal
				title="Submit Feedback"
				isVisible={showFeedbackModal}
				onClose={() => {
					setShowFeedbackModal(false);
					setMessage("");
					setAttachment(null);
				}}
			>
				<div className="space-y-4">
					<p className="text-sm text-gray-500 mb-4">
						Tell us what you think. Share suggestions, report issues, or let us know
						what's working well.
					</p>
					<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
						<div>
							<label className="text-sm font-medium text-gray-700">
								Your Feedback
							</label>
							<textarea
								value={message}
								onChange={(e) => {
									const value = e.target.value.slice(0, 5000);
									setMessage(value);
								}}
								rows={6}
								placeholder="Share your thoughts, suggestions, or report issues..."
								className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
								required
							/>
							<div className="text-right text-xs text-gray-400">
								{message.length} / 5000
							</div>
						</div>
						<div>
							<label className="text-sm font-medium text-gray-700">
								Attachments (optional)
							</label>
							<div className="mt-2 border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center">
								<input
									type="file"
									accept={ATTACHMENT_ACCEPT}
									onChange={(e) => setAttachment(e.target.files?.[0] || null)}
									className="hidden"
									id="feedback-attachment-modal"
								/>
								<label
									htmlFor="feedback-attachment-modal"
									className="cursor-pointer text-primary font-semibold"
								>
									Click to upload files
								</label>
								<p className="text-xs text-gray-400 mt-1">
									Images (JPG, PNG, GIF, WEBP), video (MP4, MOV, AVI, WEBM), PDF or
									text files. Max 10MB.
								</p>
								{attachment && (
									<div className="mt-2 flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
										<span className="truncate">{attachment.name}</span>
										<button
											type="button"
											onClick={() => setAttachment(null)}
											className="text-red-500"
										>
											Remove
										</button>
									</div>
								)}
							</div>
						</div>
						<ShButton
							type="button"
							onClick={(e) => {
								e.preventDefault();
								handleSubmit(e);
							}}
							disabled={isSubmitting}
							className="rounded-2xl bg-primary cursor-pointer text-white h-12 shadow-none hover:bg-secondaryAlt"
						>
							{isSubmitting ? "Submitting..." : "Submit Feedback"}
						</ShButton>
					</form>
				</div>
			</Modal>

			<Modal
				title="Feedback Details"
				isVisible={Boolean(selectedFeedback)}
				onClose={() => setSelectedFeedback(null)}
			>
				{selectedFeedback && (
					<div className="space-y-3">
						<p className="text-sm text-gray-500">
							Submitted by{" "}
							<span className="font-semibold text-gray-800">
								{selectedFeedback?.user?.fullname ||
									selectedFeedback?.user?.username ||
									"User"}
							</span>
						</p>
						<div className="text-gray-700 whitespace-pre-wrap">
							{selectedFeedback.message}
						</div>
						<div className="flex items-center justify-between text-sm">
							<span>
								{formatDate(selectedFeedback.createdAt)} -{" "}
								{formatTime(selectedFeedback.createdAt)}
							</span>
							<AttachmentBadge attachment={selectedFeedback.attachment} />
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default Feedback;

