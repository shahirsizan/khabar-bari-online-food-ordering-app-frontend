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
			className="servicesSection font-atma py-8 lg:py-12"
			id="services"
		>
			<div className="text-center mb-14 mx-auto">
				<p className="py-4 text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary drop-shadow-[1px_1px_0px_black]">
					আমাদের সেবাসমূহ
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 md:gap-5 place-items-center">
				{ServicesData.map((service, idx) => (
					<div
						key={idx}
						className="w-full bg-gradient-to-r from-primary to-secondary text-white rounded-2xl relative shadow-xl group "
					>
						{/* image */}
						<div className="w-full flex justify-center items-center">
							<div className="h-[100px] w-[100px] px-3 py-3 rounded-full overflow-hidden">
								<img
									src={service.img}
									className="h-full w-full object-cover group-hover:scale-110 group-hover:rotate-6 duration-300"
								/>
							</div>
						</div>

						{/* texts */}
						<div className="p-2 text-center">
							<h1 className="text-xl lg:text-2xl font-semibold drop-shadow-[1px_1px_0px_black]">
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
