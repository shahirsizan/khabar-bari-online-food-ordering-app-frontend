export const createAuditLogQueryBuilder = () => {
	const dynamicQuery = {};

	const builder = {
		filterByAction(action) {
			if (action) {
				dynamicQuery.action = action;
			}
			/***
			 * return the builder reference so that next method in the chain can execute over the updated object.
			 */
			return builder;
		},

		filterByTargetEntity(targetEntityType) {
			if (targetEntityType) {
				dynamicQuery.targetEntityType = targetEntityType;
			}
			/***
			 * return the builder reference so that next method in the chain can execute over the updated object.
			 */
			return builder;
		},

		filterBySearch(search) {
			if (search && search.trim() !== "") {
				const searchRegex = { $regex: search.trim(), $options: "i" };
				dynamicQuery.$or = [
					{ userEmail: searchRegex },
					{ action: searchRegex },
					{ targetEntityType: searchRegex },
				];
			}
			/***
			 * return the builder reference so that next method in the chain can execute over the updated object.
			 */
			return builder;
		},

		build() {
			/***
			 * Shallow copy prevents external mutation of builder state
			 */
			return { ...dynamicQuery };
		},
	};

	return builder;
};
