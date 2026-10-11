import { FilterQuery } from "mongoose";
import {
	IAuditLog,
	AuditAction,
	AuditTargetEntity,
} from "../model/AuditLogModel.js";

interface IAuditLogQueryBuilder {
	filterByAction(action?: AuditAction): IAuditLogQueryBuilder;
	filterByTargetEntity(
		targetEntityType?: AuditTargetEntity,
	): IAuditLogQueryBuilder;
	filterBySearch(search?: string): IAuditLogQueryBuilder;
	build(): FilterQuery<IAuditLog>;
}

export const createAuditLogQueryBuilder = (): IAuditLogQueryBuilder => {
	const dynamicQuery: FilterQuery<IAuditLog> = {};

	const builder: IAuditLogQueryBuilder = {
		filterByAction(action) {
			if (action) {
				dynamicQuery.action = action as AuditAction;
			}
			/***
			 * return the builder reference so that next method in the chain can execute over the updated object.
			 */
			return builder;
		},

		filterByTargetEntity(targetEntityType) {
			if (targetEntityType) {
				dynamicQuery.targetEntityType =
					targetEntityType as AuditTargetEntity;
			}
			/***
			 * return the builder reference so that next method in the chain can execute over the updated object.
			 */
			return builder;
		},

		filterBySearch(search) {
			if (search && search.trim() !== "") {
				const searchRegex = {
					$regex: search.trim(),
					$options: "i",
				};
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
