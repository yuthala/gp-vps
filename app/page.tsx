export default function Home() {
	return (
		<div className="w-full">
			<div className="w-full flex justify-center">
				<div className="w-full max-w-7xl min-w-sm px-4">
					<section className="mb-8">
						<div className="rounded-lg bg-slate-100 p-8">
							<h1 className="text-3xl md:text-4xl font-semibold mb-2">Green Pato</h1>
							<p className="text-gray-600">Welcome — responsive layout with Tailwind CSS.</p>
						</div>
					</section>

					<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="rounded-lg bg-white p-6 shadow">Column 1 content</div>
						<div className="rounded-lg bg-white p-6 shadow">Column 2 content</div>
						<div className="rounded-lg bg-white p-6 shadow">Column 3 content</div>
					</section>
				</div>
			</div>
		</div>
	);
}
