import { NavBar } from "./Navbar";

export const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-black">{children}</div>;
};

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div>
      <NavBar />
      <div className="mt-4 px-8">{children}</div>
    </div>
  );
};
