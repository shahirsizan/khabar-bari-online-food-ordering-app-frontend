import React from "react";
import AppStoreImg from "../../assets/app_store.png";
import PlayStoreImg from "../../assets/play_store.png";
import Gif from "../../assets/mobile_bike.gif";
import cook from "../../assets/cooking.png";

const AppStore = () => {
	return (
		<>
			<div className="bg-gray-100 dark:bg-gray-800 py-12">
				<div className="px-8">
					<div className="grid sm:grid-cols-2 grid-cols-1 items-center gap-4">
						{/* left */}
						<div
							data-aos="fade-up"
							data-aos-duration="200"
							className="space-y-6 max-w-lg mx-auto"
						>
							<h1 className="font-atma text-3xl text-center sm:text-5xl font-semibold text-gray-900 dark:text-gray-400">
								<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
									Android
								</span>{" "}
								এবং{" "}
								<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
									iOS
								</span>{" "}
								<br />
								ব্যবহারকারীদের জন্য
							</h1>

							<div className="flex flex-wrap justify-center sm:justify-start items-center">
								<a
									href="https://play.google.com/store/apps?hl=en"
									target="_blank"
								>
									<img
										src={PlayStoreImg}
										alt="Play store"
										className="max-w-[150px] sm:max-w-[120px] md:max-w-[200px]"
									/>
								</a>

								<a
									href="https://www.apple.com/app-store/"
									target="_blank"
								>
									<img
										src={AppStoreImg}
										alt="App store"
										className="max-w-[150px] sm:max-w-[120px] md:max-w-[200px]"
									/>
								</a>
							</div>
						</div>

						{/* right */}
						<div data-aos="zoom-in" data-aos-duration="200">
							<img
								src={cook}
								// className="animate-float rotate-6 w-full max-w-md sm:max-w-lg lg:max-w-[70%] block rounded-md mx-auto mix-blend-multiply dark:mix-blend-difference"
								className=" rotate-3 rounded-3xl w-full max-w-md sm:max-w-lg lg:max-w-[70%] block rounded-md mx-auto mix-blend-multiply dark:mix-blend-difference"
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default AppStore;
