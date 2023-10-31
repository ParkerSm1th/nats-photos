import { RootLayout } from "@/components/global/Layout";
import { UserProfile } from "@clerk/nextjs";
import { ReactElement } from "react";

function Auth() {
  return (
    <div className="flex items-center justify-center bg-white">
      <UserProfile />
    </div>
  );
}

Auth.getLayout = function getLayout(page: ReactElement) {
  return <RootLayout>{page}</RootLayout>;
};

export default Auth;
