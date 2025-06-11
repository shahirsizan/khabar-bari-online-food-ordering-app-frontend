import React from "react";

const Error = () => {
	const urlparams = new URLSearchParams(window.location.search);
	const message = urlparams.get("message");

	return <div className="pt-16">Payment {message}</div>;
};

export default Error;
