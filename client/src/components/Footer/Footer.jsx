import { FaLocationArrow, FaMobileAlt } from "react-icons/fa";
import footerLogo from "../../assets/food-logo.png";
import { Link } from "react-router-dom";

const Footer = () => {
	const year = new Date().getFullYear();

	return (
		<section className="footerSection py-5 font-atma">
			<div className=" text-lg py-3 px-4 flex flex-col sm:flex-row sm:justify-between">
				<h1 className="max-sm:m-auto font-bold sm:text-left text-justify flex items-center gap-3">
					<img
						src={footerLogo}
						className="w-10 drop-shadow-[1px_1px_0px_black]"
					/>
					<span className="text-2xl lg:text-3xl bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary/90 drop-shadow-[1px_1px_0px_black]">
						খাবারবাড়ি
					</span>
				</h1>

				<div className="flex max-sm:m-auto items-center gap-3 font-semibold">
					<FaLocationArrow className="text-lg" />
					<p className="text-lg bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary drop-shadow-[1px_1px_0px_black]">
						Dhaka, Bangladesh
					</p>
				</div>

				<div className="flex max-sm:m-auto items-center gap-3 font-semibold">
					<FaMobileAlt className="text-lg" />
					<p className="text-lg bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary drop-shadow-[1px_1px_0px_black]">
						01819991239
					</p>
				</div>

				<div className=" font-semibold text-center bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary drop-shadow-[1px_1px_0px_black]">
					© Copyright {year} All rights reserved
				</div>
			</div>

			<div className=" text-center py-1 text-xl border-gray-300/50">
				Developed by:{" "}
				<Link
					to={"https://github.com/shahirsizan"}
					target="_blank"
					className="font-semibold bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary drop-shadow-[1px_1px_0px_black]"
				>
					<span className="flex-nowrap">Shahir Adil Sizan</span>
				</Link>
			</div>

			<div className=" text-center py-1 text-xl border-gray-300/50">
				Source Code:{" "}
				<Link
					to={
						"https://github.com/shahirsizan/khabar-bari-online-food-ordering-app-frontend"
					}
					target="_blank"
					className="font-semibold bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary drop-shadow-[1px_1px_0px_black]"
				>
					Github
				</Link>
			</div>
		</section>
	);
};

export default Footer;
