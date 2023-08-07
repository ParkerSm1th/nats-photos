import { RootLayout } from "@/components/global/Layout";
import { api } from "@/utils/api";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { ReactElement } from "react";

function Home() {
  const hello = api.user.hello.useQuery({ text: "from tRPC" });
  const shows = api.shows.getAll.useQuery({});

  return (
    <>
      <Head>
        <title>Natalie Lockhart&apos;s Equine Photos</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Natalie Lockhart&apos;s Equine Photos
          </h1>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {hello.data ? hello.data.greeting : "Loading tRPC query..."}
            </p>
            <AuthShowcase />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-2xl font-bold text-white">Shows</h3>
            <ul className="text-center text-2xl text-white">
              {shows.data
                ? shows.data.map((show) => {
                    return (
                      <li key={show.id}>
                        <a
                          className="bold text-white no-underline"
                          href={`/photos/shows/${show.slug}`}
                        >
                          {show.name}
                        </a>
                        {show.children && (
                          <div className="flex flex-row items-center gap-2">
                            {show.children.map((child) => (
                              <div key={child.id}>
                                <a
                                  className="text-white underline"
                                  href={`/photos/shows/${show.slug}/${child.slug}`}
                                >
                                  {child.name}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })
                : "Loading shows"}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.user.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <RootLayout>{page}</RootLayout>;
};

export default Home;
