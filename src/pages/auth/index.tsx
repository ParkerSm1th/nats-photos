import { RootLayout } from "@/components/global/Layout";
import { SignIn } from "@clerk/nextjs";
import { ReactElement } from "react";

function Auth() {
  return (
    <div className="h-100 flex h-screen w-full items-center justify-center bg-white">
      <SignIn path="/auth" redirectUrl="/photos" signUpUrl="/auth/signup" />
    </div>
  );
}

Auth.getLayout = function getLayout(page: ReactElement) {
  return <RootLayout>{page}</RootLayout>;
};

export default Auth;
