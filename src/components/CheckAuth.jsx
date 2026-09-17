import { logoutUser } from "@/redux/actions/userActions";
import { customFetch } from "@/utils";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CheckAuth() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const check = async () => {
		const res = await customFetch.get("/user/check-authenticated");
		if (res?.data?.data?.authenticated) return;
		dispatch(logoutUser());
		localStorage.clear();
		return navigate("/login");
	};
	useEffect(() => {
		check();
		const interval = setInterval(() => {
			check();
		}, 1000 * 60);
		return () => {
			clearInterval(interval);
		};
	}, []);
	return null;
}
