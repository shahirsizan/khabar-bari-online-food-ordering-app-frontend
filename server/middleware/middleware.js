const axios = require("axios");
const globals = require("node-global-storage");

class middleware {
	// To get `Grant_Token`
	bkash_auth = async (req, res, next) => {
		globals.unsetValue("id_token"); //because upon grant_token call, a new id_token will be returned. SO we first delete the existing one

		try {
			// console.log("inside middleware");
			const { data } = await axios.post(
				process.env.bkash_grant_token_url,
				{
					app_key: process.env.bkash_api_key,
					app_secret: process.env.bkash_secret_key,
				},
				{
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						username: process.env.bkash_username,
						password: process.env.bkash_password,
					},
				}
			);
			globals.setValue("id_token", data.id_token, { protected: true });
			// req.newData = data;
			// console.log(data);
			next();
		} catch (error) {
			return res.status(401).json({
				error: error.message,
			});
		}
	};
}

module.exports = new middleware();
