import { RootLayout } from "@/components/global/Layout";
import { SignUp } from "@clerk/nextjs";
import { ReactElement } from "react";

function AuthSignUp() {
  return (
    <div className="h-100 flex h-screen w-full items-center justify-center bg-white">
      <SignUp path="/signup" redirectUrl="/photos" signInUrl="/sign-in" />
    </div>
  );
}

AuthSignUp.getLayout = function getLayout(page: ReactElement) {
  return <RootLayout>{page}</RootLayout>;
};

export default AuthSignUp;
