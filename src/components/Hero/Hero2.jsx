import React, { useState } from "react";
import BiryaniImg1 from "../../assets/biryani3.png";
import BiryaniImg2 from "../../assets/biryani5.png";
import BiryaniImg3 from "../../assets/biryani2.png";
import Vector from "../../assets/vector3.png";

const ImageList = [
	{
		id: 1,
		img: BiryaniImg1,
	},
	{
		id: 2,
		img: BiryaniImg2,
	},
	{
		id: 3,
		img: BiryaniImg3,
	},
];

const Hero2 = () => {
	const bgImage = {
		backgroundImage: `url(${Vector})`,
		backgroundPosition: "center",
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		height: "100%",
		width: "100%",
	};

	return (
		<div
			className="min-h-[550px] sm:min-h-[600px] pt-32 bg-gray-100 flex justify-center items-center dark:bg-gray-950 dark:text-white duration-200"
			style={bgImage}
		>
			<div className="container pb-8 sm:pb-0 sm:px-16 lg:px-32">
				<div className="grid grid-cols-1 sm:grid-cols-2">
					{/* LEFT */}
					<div
						data-aos="zoom-out"
						data-aos-duration="400"
						data-aos-once="true"
						className="font-atma flex flex-col justify-center gap-4 pt-4 sm:pt-0 text-center sm:text-left order-2 sm:order-1"
					>
						<h1 className=" text-5xl sm:text-6xl lg:text-8xl font-bold">
							<span class="drop-shadow-[0_1px_1px_black] bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary/90">
								খাবারবাড়ি
								<br />
							</span>{" "}
							তে স্বাগতম!
						</h1>
						<p className="text-3xl ">
							সুস্বাদু খাবারের নির্ভরযোগ্য ঠিকানা
						</p>
						<div>
							<button className="drop-shadow-[0_1px_1px_black] bg-gradient-to-r from-primary to-secondary/95 hover:scale-105 duration-200 text-white text-2xl py-3 px-8 rounded-full">
								অর্ডার করুন
							</button>
						</div>
					</div>

					{/* RIGHT */}
					<div className="relative min-h-[250px] sm:min-h-[450px] flex space-x-3 justify-center items-center order-1 sm:order-2 ">
						<div className="absolute h-[250px] sm:h-[550px] overflow-hidden flex justify-center items-center">
							<img
								data-aos="zoom-in"
								data-aos-duration="200"
								data-aos-once="true"
								src={ImageList[0].img}
								className="w-[200px] sm:w-[550px] sm:scale-125 lg:scale-150 mx-auto spin"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Hero2;
