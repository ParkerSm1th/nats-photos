import { SpinnerPage } from "@/components/global/Spinner";
import { DynamicShowNameBreadcrumb } from "@/components/shows/DynamicShowNameBreadcrumb";
import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";
import { api } from "@/utils/api";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import superjson from "superjson";

export default function Show(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter();
  const slugs = props.slug;
  if (!slugs) return null;
  const furthestRightSlug = slugs[slugs.length - 1];
  if (!furthestRightSlug) return null;
  const show = api.shows.getShowBySlug.useQuery({
    slug: furthestRightSlug,
  });

  const showName = api.shows.getShowNameBySlug.useQuery({
    slug: furthestRightSlug,
  });

  return !showName.data ? (
    <div>Error</div>
  ) : (
    <>
      <Head>
        <title>{showName.data}</title>
      </Head>
      <main className="flex flex-col items-center justify-center">
        <DynamicShowNameBreadcrumb slugs={slugs} />
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-8 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-black">
            {showName.data}
          </h1>
          <div className="flex flex-row items-center gap-2">
            {show.isLoading ? (
              <SpinnerPage />
            ) : (
              <>
                {show.data?.children && (
                  <div className="flex flex-row items-center gap-2">
                    {show.data?.children.map((child) => (
                      <div key={child.id}>
                        <Link
                          className="text-black underline"
                          href={`/photos/shows/${slugs.join("/")}/${
                            child.slug
                          }`}
                        >
                          {child.name}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ slug: string[] }>
) {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, auth: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;
  if (!slug) throw new Error("No slug");
  const furthestRightSlug = slug[slug.length - 1];

  if (typeof furthestRightSlug !== "string") throw new Error("No slug");

  await ssg.shows.getShowNameBySlug.prefetch({ slug: furthestRightSlug });
  await ssg.shows.getShowsBySlug.prefetch(slug);

  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug,
    },
  };
}
