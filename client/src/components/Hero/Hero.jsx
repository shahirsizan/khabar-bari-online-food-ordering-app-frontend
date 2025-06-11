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

const Hero = () => {
	const [imageId, setImageId] = useState(BiryaniImg1);

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
			className="min-h-[550px] sm:min-h-[600px] bg-gray-100 flex justify-center items-center dark:bg-gray-950 dark:text-white duration-200"
			style={bgImage}
		>
			<div className="container pb-8 sm:pb-0">
				<div className="grid grid-cols-1 sm:grid-cols-2">
					{/* LEFT */}
					<div
						data-aos="zoom-out"
						data-aos-duration="400"
						data-aos-once="true"
						className="font-atma flex flex-col justify-center gap-4 pt-12 sm:pt-0 text-center sm:text-left order-2 sm:order-1"
					>
						<h1 className="max-[380px]:text-xl text-5xl sm:text-6xl lg:text-7xl font-bold">
							<span class="drop-shadow-[0_1px_1px_black] bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary/90">
								খাবারবাড়ি
								<br />
							</span>{" "}
							তে স্বাগতম
						</h1>
						<p className="text-2xl ">
							সুস্বাদু খাবারের নির্ভরযোগ্য ঠিকানা
						</p>
						<div>
							<button className="drop-shadow-[0_1px_1px_black] bg-gradient-to-r from-primary to-secondary/95 hover:scale-105 duration-200 text-white text-2xl py-3 px-8 rounded-full">
								অর্ডার করুন
							</button>
						</div>
					</div>

					{/* RIGHT */}
					<div className="relative min-h-[450px] sm:min-h-[450px] flex space-x-3 justify-center items-center order-1 sm:order-2 ">
						<div className="absolute right-5 h-[300px] sm:h-[450px] overflow-hidden flex justify-center items-center">
							<img
								data-aos="zoom-in"
								data-aos-duration="300"
								data-aos-once="true"
								src={imageId}
								className="w-[300px] sm:w-[450px] sm:scale-125  mx-auto spin "
							/>
						</div>

						<div className="flex lg:flex-col lg:top-1/2 lg:-translate-y-1/2 lg:py-2 justify-center gap-4 absolute bottom-[0px] lg:-right-10 bg-white/30 rounded-full">
							{ImageList.map((item) => (
								<img
									data-aos="zoom-in"
									data-aos-duration="400"
									data-aos-once="true"
									src={item.img}
									onClick={() => {
										setImageId(
											item.id === 1
												? BiryaniImg1
												: item.id === 2
												? BiryaniImg2
												: BiryaniImg3
										);
									}}
									className={`max-w-[80px] h-[80px] object-contain inline-block cursor-pointer ${
										item.id === imageId ? "" : "border-3"
									} `}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Hero;
