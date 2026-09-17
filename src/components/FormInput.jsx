// eslint-disable-next-line no-unused-vars
import React from "react";

// eslint-disable-next-line react/prop-types
const FormInput = ({
	label,
	name,
	type,
	placeholder,
	size,
	onChange,
	value,
	options = [],
}) => {
	// Ensure that value is always initialized
	const inputValue = value || "";
	let seq = 0;

	return (
		<div className="form-control">
			<label htmlFor={name} className="label">
				<span className="label-text capitalize">{label}</span>
			</label>
			<input
				type={type}
				name={name}
				onChange={onChange}
				placeholder={placeholder}
				className={`input h-10 input-bordered w-${size}`}
				value={inputValue} // Use the initialized value
				list={options.length ? label : null}
			/>
			{options.length ? (
				<datalist id={label}>
					{options.map((op) => (
						<option value={op} key={seq++} />
					))}
				</datalist>
			) : null}
		</div>
	);
};

export default FormInput;
