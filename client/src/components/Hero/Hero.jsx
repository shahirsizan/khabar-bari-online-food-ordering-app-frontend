import BiryaniImg1 from "../../assets/biryani3.png";
import BiryaniImg2 from "../../assets/biryani5.png";
import BiryaniImg3 from "../../assets/biryani2.png";
import biryaniherocompressed from "../../assets/biryaniherocompressed.png";
import heroimage from "../../assets/heroimage.jpg";

const Hero = () => {
	const bgImage = {
		backgroundImage: `url(${heroimage})`,
		backgroundPosition: "center",
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		height: "100%",
		width: "100%",
	};

	const scrollToRecipeSection = () => {
		const section = document.getElementById("recipeList");
		if (section) {
			section.scrollIntoView({ behavior: "smooth" });
		}
	};

	return (
		<section
			className="heroSection min-h-[550px] sm:min-h-[600px] pt-10 md:pt-32 pb-8 sm:pb-0 flex justify-center items-center px-[5vw] md:px-[8vw] lg:px-[10vw] "
			style={bgImage}
		>
			<div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-20 xl:gap-x-36">
				{/* <div className="flex flex-col sm:flex-row justify-center items-center"> */}
				{/* LEFT */}
				<div
					data-aos="zoom-in"
					data-aos-duration="700"
					data-aos-once="true"
					className="font-atma text-white flex flex-col justify-center gap-4 pt-4 sm:pt-0 text-center sm:text-left order-2 sm:order-1"
				>
					<h1 className="font-bold">
						<span className="py-4 text-3xl md:text-5xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary drop-shadow-[3px_0px_3px_black]">
							খাবারবাড়ি
							<br />
						</span>{" "}
						<span className="text-2xl md:text-3xl whitespace-nowrap drop-shadow-[3px_0px_3px_black]">
							তে স্বাগতম!
						</span>
					</h1>

					<div>
						<button
							onClick={() => {
								scrollToRecipeSection();
							}}
							className="border-none bg-gradient-to-r from-primary to-secondary/95 hover:scale-105 duration-200 text-lg md:text-2xl xl:text-3xl font-semibold py-1 lg:py-3 px-3 lg:px-6 rounded-xl drop-shadow-[2px_3px_2px_black]"
						>
							অর্ডার করুন
						</button>
					</div>
				</div>

				{/* IMAGE */}
				<div
					className="flex items-center justify-center min-h-[250px] sm:min-h-[450px] space-x-3 order-1 sm:order-2 "
					data-aos="zoom-out"
					data-aos-duration="700"
					data-aos-once="true"
				>
					<div className="w-full overflow-hidden flex justify-center items-center">
						<img
							src={biryaniherocompressed}
							className="w-[200px] sm:w-[4800px] sm:scale-125 lg:scale-150 mx-auto spin"
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
