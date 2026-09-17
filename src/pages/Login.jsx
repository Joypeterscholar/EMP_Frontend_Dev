import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

import "../styles/Login.css";
import { baseURL, customFetch } from "../utils";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { SubmitBtn } from "../components";
import png from "../assets/mask.png";
import { loginUser } from "../redux/actions/userActions";
import {
	getAccessTokenFromLocalStorage,
	getUserFromLocalStorage,
} from "../redux/reducers/userReducer";

// Import shadcn components
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";

const Login = () => {
	const user = useSelector((state) => state.userState.user);
	const localUser = getUserFromLocalStorage();
	const localAccessToken = getAccessTokenFromLocalStorage();
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoggedin, setIsLoggedin] = useState(false);
	const [reRouteUrl, setReRouteUrl] = useState("");
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
				rerouteUrl = "/tagger";
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
		<div className="min-h-screen flex">
			{/* Left side - Hero Image */}
			{/* <div className="lg:flex lg:w-1/2 text-center relative bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-gray-900/20" />
        <img 
          src={png} 
          alt="background" 
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative w-full flex flex-col items-center justify-center p-12 text-white">
          <h1 className="text-4xl text-black font-bold mb-4">Welcome to Our Platform</h1>
          <p className="text-lg text-black text-center max-w-md">
            Secure, efficient, and reliable environmental data management system.
          </p>
        </div>
      </div> */}

			{/* Right side - Login Form */}
			<div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white">
				<div className="w-full max-w-[440px] space-y-8">
					<div className="flex flex-col items-center space-y-4">
						<img src={logo} alt="logo" className="h-16 w-auto" />
						<div className="text-center space-y-2">
							<h1 className="text-3xl font-bold tracking-tight text-gray-900">
								Welcome back
							</h1>
							<p className="text-sm text-gray-500">
								Please enter your credentials to access your account
							</p>
						</div>
					</div>

					<form className="space-y-6">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="text-sm font-medium text-gray-700"
								>
									Email address
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="name@company.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="h-11"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="password"
									className="text-sm font-medium text-gray-700"
								>
									Password
								</Label>
								<div className="relative">
									<Input
										id="password"
										type={passwordVisible ? "text" : "password"}
										placeholder="Enter your password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="h-11"
										required
									/>
									<button
										type="button"
										onClick={() =>
											setPasswordVisible(!passwordVisible)
										}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
									>
										{passwordVisible ? (
											<FaEyeSlash className="h-5 w-5" />
										) : (
											<FaEye className="h-5 w-5" />
										)}
									</button>
								</div>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<Checkbox id="remember" className="rounded-sm" />
								<label
									htmlFor="remember"
									className="text-sm text-gray-600 select-none"
								>
									Remember me
								</label>
							</div>
						</div>

						<div className="space-y-4">
							<Button
								type="submit"
								className="w-full h-11 text-base font-semibold"
								disabled={isSubmitting}
								onClick={handleSubmit}
							>
								{isSubmitting ? (
									<div className="flex items-center justify-center space-x-2">
										<div className="w-4 h-4 border-2 border-white border-t-transparent cursor-pointer rounded-full animate-spin" />
										<span className="text-white">Signing in...</span>
									</div>
								) : (
									<span className="text-white">Sign in</span>
								)}
							</Button>

							<p className="text-center text-sm text-gray-500">
								Don't have an account?{" "}
								<Link
									to="/register"
									className="font-medium text-primary hover:text-primary/80 transition-colors"
								>
									Create one
								</Link>
							</p>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Login;
