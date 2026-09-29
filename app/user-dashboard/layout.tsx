import UserSideNav from "@/app/ui/user-dashboard/user-sidenav";

export default function Layout({ children }: {children: React.ReactNode}) {
    return (
			<div className="w-full max-w-7xl min-w-xs flex h-screen flex-col md:flex-row md:overflow-hidden">
				<div className="w-full flex-none md:w-76 md:overflow-y-auto">
					<UserSideNav />
				</div>
				<div className="w-full grow md:overflow-y-auto">{children}</div>
			</div>
    );
}