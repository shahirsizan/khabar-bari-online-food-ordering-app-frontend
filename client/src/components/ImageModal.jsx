import React from "react";

const ImageModal = ({ setShowImageModal, selectedImage }) => {
	return (
		<div
			onClick={() => {
				setShowImageModal(false);
			}}
			className="fixed inset-0 z-50 flex items-center justify-center bg-amber-900/40 backdrop-blur-sm"
		>
			<div className=" relative max-w-full max-h-full">
				<img
					className=" max-w-[90vw] max-h-[90vh] rounded-lg object-contain"
					src={selectedImage}
				/>

				<button
					onClick={() => {
						setShowImageModal(false);
					}}
					className=" absolute top-1 right-1 bg-amber-900/80 rounded-full p-2 text-black hover:bg-amber-800/90 transition-all
                           duration-200"
				>
					<svg
						stroke="currentColor"
						fill="currentColor"
						strokeWidth="0"
						viewBox="0 0 352 512"
						className="w-6 h-6"
						height="1em"
						width="1em"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
					</svg>
				</button>
			</div>
		</div>
	);
};

export default ImageModal;
