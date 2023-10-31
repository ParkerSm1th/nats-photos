import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="h-100 flex w-full items-center justify-center bg-white">
      <SignIn path="/sign-in" signUpUrl="/signup" routing="path" key="signin" />
    </div>
  );
}
