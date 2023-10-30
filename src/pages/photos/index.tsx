import { UserButton } from "@clerk/nextjs";

export default function PhotosHome() {
  return (
    <div className="flex h-20 flex-col items-center justify-center">
      <UserButton afterSignOutUrl="/">Hi</UserButton>
      <h1 className="text-3xl font-bold text-black">Get your photos here!</h1>
    </div>
  );
}
