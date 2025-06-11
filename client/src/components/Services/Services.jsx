import React from "react";
import Img from "../../assets/biryani.png";
import Img2 from "../../assets/biryani2.png";
import Img3 from "../../assets/biryani4.png";
import scooterImg from "../../assets/scooter.png";
import dineImg from "../../assets/dine-in.png";
import takeaway from "../../assets/takeaway.png";
import StarRatings from "react-star-ratings";
const ServicesData = [
	{
		id: 1,
		img: scooterImg,
		name: "হোম ডেলিভারি",
		description: "আপনার পছন্দের খাবার পৌঁছে যাবে সরাসরি আপনার দোরগোড়ায়",
	},
	{
		id: 2,
		img: dineImg,
		name: "ডাইন ইন",
		description:
			"পরিবার ও বন্ধুদের সঙ্গে আরামদায়ক পরিবেশে খাবার উপভোগ করুন",
	},
	{
		id: 3,
		img: takeaway,
		name: "টেক এওয়ে",
		description: "অর্ডার করুন অনলাইনে, এরপর সময়মতো এসে খাবার নিয়ে যান",
	},
];

const Services = () => {
	return (
		<>
			<span id="services"></span>
			<div className="py-12">
				<div className="container">
					<div className="text-center mb-14  mx-auto">
						<p className="py-4 text-5xl md:text-7xl font-atma font-bold bg-clip-text text-transparent drop-shadow-[0_1px_1px_black] bg-gradient-to-r from-primary to-secondary ">
							আমাদের সেবাসমূহ
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-14 md:gap-5 place-items-center">
						{ServicesData.map((service, idx) => (
							<div
								key={idx}
								className="rounded-2xl font-atma bg-white dark:bg-gray-800 relative shadow-xl group max-w-[300px]"
							>
								{/* image */}
								<div className="w-full flex justify-center items-center">
									<div className="h-[150px] w-[150px] px-5 py-5 rounded-full overflow-hidden">
										<img
											src={service.img}
											className=" h-full w-full object-cover group-hover:scale-105 group-hover:rotate-6 duration-300"
										/>
									</div>
								</div>

								{/* texts */}
								<div className="p-4 text-center">
									<h1 className="text-3xl font-bold">
										{service.name}
									</h1>
									<p className="dark:text-gray-300 duration-high text-lg line-clamp-2">
										{service.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
};

export default Services;
