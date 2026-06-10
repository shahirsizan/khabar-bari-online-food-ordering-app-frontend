export default function DeleteModal({ show, onClose, onDelete }) {
	if (!show) {
		return null;
	}

	return (
		<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
				<h2 className="text-xl font-bold mb-4">Are you sure?</h2>

				<p className="mb-6">This action cannot be undone.</p>

				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => {
							onClose();
						}}
						className="bg-gray-200 px-4 py-2 rounded"
					>
						Cancel
					</button>

					<button
						type="button"
						onClick={() => {
							onDelete();
						}}
						className="bg-red-500 text-white px-4 py-2 rounded"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
}
