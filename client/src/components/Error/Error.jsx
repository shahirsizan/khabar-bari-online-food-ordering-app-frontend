import React from "react";

const Error = () => {
	const urlparams = new URLSearchParams(window.location.search);
	const message = urlparams.get("message");

	return (
		<div className="pt-32 flex items-center justify-center md:pt-40">
			<div className="">Payment {message}</div>
		</div>
	);
};

export default Error;
