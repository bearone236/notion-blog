import Head from 'next/head';
import { getPostsForTopPage, getAllTags } from '../lib/notionAPI';
import SinglePost from '../components/Post/SinglePost';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { Tag } from '../components/Tag/Tag';

export const getStaticProps: GetStaticProps = async () => {
  const fourPosts = await getPostsForTopPage(4);
  const allTags = await getAllTags();

  return {
    props: {
      fourPosts,
      allTags,
    },
    revalidate: 10, // revalidate: ISR設定を行うプロパティ (秒数を設定)
  };
};

export default function Home({ fourPosts, allTags }) {
  // console.log(allPosts);
  return (
    <div className="container h-full w-full mx-auto ">
      <Head>
        <title>Notion-Blog</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container w-full mt-16">
        <h1 className="text-5xl font-medium text-center mb-16">Notion Blog🚀</h1>
        {fourPosts.map((post) => (
          <div className="mx-4" key={post.id}>
            <SinglePost title={post.title} description={post.description} date={post.date} tags={post.tags} slug={post.slug} isPagenationPage={false} />
          </div>
        ))}

        <Link href="/posts/page/1" className="mb-6 lg:w-1/2 mx-auto  px-5 block text-right">
          ...もっと見る
        </Link>
        <Tag tags={allTags} />
      </main>
    </div>
  );
}
