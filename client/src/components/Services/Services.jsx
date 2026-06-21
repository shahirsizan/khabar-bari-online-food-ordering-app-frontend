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
	},
	{
		id: 2,
		img: dineImg,
		name: "ডাইন ইন",
	},
	{
		id: 3,
		img: takeaway,
		name: "টেক এওয়ে",
	},
];

const Services = () => {
	return (
		<section
			className="servicesSection font-atma py-8 lg:py-12 px-[5vw] md:px-[8vw] lg:px-[10vw]"
			id="services"
		>
			<div className="text-center mb-14 mx-auto">
				<p className="py-4 text-3xl md:text-5xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary drop-shadow-[2px_1px_2px_black]">
					আমাদের সেবাসমূহ
				</p>
			</div>

			<div className="grid grid-cols-3 gap-2 md:gap-5 place-items-center">
				{ServicesData.map((service, idx) => (
					<div
						key={idx}
						className="w-full bg-gradient-to-r from-primary to-secondary text-white rounded-2xl relative shadow-xl group "
					>
						{/* image */}
						<div className="w-full flex justify-center items-center">
							<div className="h-[70px] w-[70px] md:h-[100px] md:w-[100px] px-2 py-2 rounded-full overflow-hidden">
								<img
									src={service.img}
									className="h-full w-full object-cover group-hover:rotate-6 duration-300"
								/>
							</div>
						</div>

						{/* texts */}
						<div className="p-2 text-center overflow-hidden">
							<h1 className="text-xs sm:text-sm md:text-xl font-semibold drop-shadow-[2px_1px_2px_black] whitespace-nowrap">
								{service.name}
							</h1>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default Services;
