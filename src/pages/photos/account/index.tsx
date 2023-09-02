import Link from "next/link";

export default function Account() {
  return (
    <>
      Your Account <Link href={"/photos/people"}>people</Link>
    </>
  );
}
