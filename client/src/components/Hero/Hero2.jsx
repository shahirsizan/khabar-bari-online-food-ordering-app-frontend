import BiryaniImg1 from "../../assets/biryani3.png";
import BiryaniImg2 from "../../assets/biryani5.png";
import BiryaniImg3 from "../../assets/biryani2.png";
import biryaniherocompressed from "../../assets/biryaniherocompressed.png";
import heroimage from "../../assets/heroimage.jpg";

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
		backgroundImage: `url(${heroimage})`,
		backgroundPosition: "center",
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		height: "100%",
		width: "100%",
	};

	return (
		<section
			className="heroSection min-h-[550px] sm:min-h-[600px] pt-20 md:pt-32 pb-8 sm:pb-0 flex justify-center items-center px-[5vw] md:px-[8vw] lg:px-[10vw] "
			style={bgImage}
		>
			<div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-20 xl:gap-x-36">
				{/* <div className="flex flex-col sm:flex-row justify-center items-center"> */}
				{/* LEFT */}
				<div
					data-aos="zoom-out"
					data-aos-duration="400"
					data-aos-once="true"
					className="font-atma text-white flex flex-col justify-center gap-4 pt-4 sm:pt-0 text-center sm:text-left order-2 sm:order-1"
				>
					<h1 className="font-bold">
						<span class="text-6xl md:text-8xl xl:text-9xl drop-shadow-[0_2px_5px_black] bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary/90">
							খাবারবাড়ি
							<br />
						</span>{" "}
						<span className="text-4xl md:text-5xl xl:text-7xl whitespace-nowrap drop-shadow-[5px_5px_5px_black]">
							তে স্বাগতম!
						</span>
					</h1>

					<div>
						<button className="bg-gradient-to-r from-primary to-secondary/95 hover:scale-105 duration-200 text-lg md:text-2xl xl:text-3xl font-semibold py-1 lg:py-3 px-4 lg:px-6 rounded-full drop-shadow-[2px_3px_2px_black]">
							<span className="drop-shadow-[1px_1px_1px_black]">
								অর্ডার করুন
							</span>
						</button>
					</div>
				</div>

				{/* IMAGE */}
				<div className="flex items-center justify-center min-h-[250px] sm:min-h-[450px] space-x-3 order-1 sm:order-2 ">
					<div className="w-full overflow-hidden flex justify-center items-center">
						<img
							data-aos="zoom-in"
							data-aos-duration="200"
							data-aos-once="true"
							src={biryaniherocompressed}
							className="w-[200px] sm:w-[4800px] sm:scale-125 lg:scale-150 mx-auto spin"
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero2;
