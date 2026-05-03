import Sidebar from "./components/sidebar";

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex gap-6">

            <div className="flex-1 px-4 md:px-16 dark:bg-black dark:text-white">
                {children}
            </div>
            <Sidebar/>
        </div>
    );
}