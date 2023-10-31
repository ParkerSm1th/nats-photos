import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="h-100 flex w-full items-center justify-center bg-white">
      <SignUp
        path="/signup"
        signInUrl="/sign-in"
        routing="path"
        key={"signup"}
      />
    </div>
  );
}
