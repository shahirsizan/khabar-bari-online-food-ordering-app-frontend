import React from "react";
import AppStoreImg from "../../assets/app_store.png";
import PlayStoreImg from "../../assets/play_store.png";
import cook from "../../assets/cooking.png";

const AppStore = () => {
	return (
		<section className="appstoreSection py-8 lg:py-12">
			<div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
				{/* LEFT */}
				<div className="space-y-6 max-w-lg mx-auto">
					{/* TEXT */}
					<h1 className="font-atma text-3xl xl:text-5xl text-center font-semibold">
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

					{/* BUTTONS */}
					<div className="flex flex-wrap justify-center items-center max-sm:pb-5">
						<a
							href="https://play.google.com/store/apps?hl=en"
							target="_blank"
						>
							<img
								src={PlayStoreImg}
								className="max-w-[150px] lg:max-w-[200px]"
							/>
						</a>

						<a
							href="https://www.apple.com/app-store/"
							target="_blank"
						>
							<img
								src={AppStoreImg}
								className="max-w-[150px] lg:max-w-[200px]"
							/>
						</a>
					</div>
				</div>

				{/* RIGHT */}
				<div>
					<img
						src={cook}
						className="rotate-2 w-full block rounded-md mx-auto mix-blend-multiply dark:mix-blend-difference"
					/>
				</div>
			</div>
		</section>
	);
};

export default AppStore;
