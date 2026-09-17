import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthLayout from "./AuthLayout";
import axios from "axios";

// Reuse existing app utils and redux actions to preserve behavior
import { baseURL, customFetch } from "../../utils";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/actions/userActions";
import {
	getAccessTokenFromLocalStorage,
	getUserFromLocalStorage,
} from "../../redux/reducers/userReducer";

// shadcn components (already present in project)
import { Button } from "../../components/ui/button";
import FloatingInput from "../../components/custom/FloatingInput";
import { CustomCheckbox } from "../../components/custom/CustomCheckbox";
import IllustrationCarousel from "../../components/custom/IllustrationCarousel";

const Login = () => {
	const user = useSelector((state) => state.userState.user);
	const localUser = getUserFromLocalStorage();
	const localAccessToken = getAccessTokenFromLocalStorage();
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoggedin, setIsLoggedin] = useState(false);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const currentUser = localUser || user;

	function reRouteByRole(role) {
		let rerouteUrl = "/";
		switch ((role || "").toLowerCase()) {
			case "superadmin":
			case "admin":
				rerouteUrl = "/admin";
				break;
			case "tagger":
				rerouteUrl = "/tagger/models";
				break;
			case "sampler":
				rerouteUrl = "/sampler";
				break;
			case "reviewer":
				rerouteUrl = "/reviewer";
				break;
		}
		navigate(rerouteUrl);
	}

	useEffect(() => {
		if (currentUser?.role) {
			reRouteByRole(currentUser.role);
		}
	}, [isLoggedin]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		console.log("Login attempt with:", { email, password });

		try {
			// Try with direct axios call to bypass customFetch issues
			const response = await axios.post(
				baseURL + "/api/user/login",
				{
					email: email.trim(),
					password: password.trim(),
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
					timeout: 10000,
				}
			);

			console.log("Login response:", response.data);

			const userData =
				response.data.status !== "error" ? response.data : null;
			if (response.data.status !== "error") {
				dispatch(loginUser(userData));
				toast.success("logged in successfully");
				setIsLoggedin(true);
			} else {
				console.log("Login error:", response.data.message);
				toast.error(`${response.data.message}`);
			}
		} catch (err) {
			console.error("Login catch error:", err);
			console.error("Error response:", err?.response?.data);
			const errorMessage =
				err?.response?.data?.message ||
				"Wrong login details or Network error";
			toast.error(errorMessage);
			return null;
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AuthLayout>
			<div className="flex items-center justify-center gap-0">
				{/* Login Card - standalone */}
				<div className="w-[668px] max-w-full bg-white rounded-[28px] shadow-xl p-8 min-h-[525px] flex flex-col justify-between">
					<div className="space-y-2 text-center mb-8">
						<h1 className="heading-regular font-extrabold tracking-tight text-primary">
							Nice to have you here!
						</h1>
					</div>

					<form
						className="flex-1 flex flex-col justify-between"
						onSubmit={handleSubmit}
					>
						<div className="space-y-8">
							<FloatingInput
								id="email"
								label="Type Email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>

							<div className="relative">
								<FloatingInput
									id="password"
									label="Enter Password"
									type={passwordVisible ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="pr-12"
									required
								/>
								<button
									type="button"
									onClick={() => setPasswordVisible(!passwordVisible)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
								>
									{passwordVisible ? (
										<FaEyeSlash className="h-5 w-5" />
									) : (
										<FaEye className="h-5 w-5" />
									)}
								</button>
							</div>
							<p className="text-xs text-gray-500 mt-1 mb-2">
								Password must not contain your name and must be 8
								characters long
							</p>

							<div className="flex items-center justify-between mt-0">
								<div className="flex items-center space-x-2">
									<CustomCheckbox id="remember" />
									<label
										htmlFor="remember"
										className="text-small font-medium text-primary select-none"
									>
										Keep me Logged In
									</label>
								</div>
								{/* Forgot Password link removed as requested */}
							</div>
						</div>

						<Button
							type="submit"
							className="w-full h-12 text-regular font-semibold bg-primary hover:bg-secondaryAlt text-white transition-colors rounded-2xl"
							disabled={isSubmitting}
							onClick={handleSubmit}
						>
							{isSubmitting ? (
								<div className="flex items-center justify-center space-x-2">
									<div className="w-4 h-4 border-2 border-white border-t-transparent cursor-pointer rounded-full animate-spin" />
									<span className="text-regular font-semibold text-white">
										Signing in...
									</span>
								</div>
							) : (
								<span className="text-regular font-semibold text-white">
									Login
								</span>
							)}
						</Button>
					</form>
				</div>

				{/* Illustration Card - side by side with login card */}
				<div className="hidden md:block">
					<IllustrationCarousel />
				</div>
			</div>
		</AuthLayout>
	);
};

export default Login;
