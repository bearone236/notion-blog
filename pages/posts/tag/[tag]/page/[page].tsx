import Head from 'next/head';
import { getAllTags, getNumberOfPageByTag, getNumberOfPages, getPostsByPage, getPostsByTagAndPage } from '../../../../../lib/notionAPI';
import SinglePost from '../../../../../components/Post/SinglePost';
import { GetStaticPaths, GetStaticProps } from 'next';
import Pagination from '../../../../../components/Pagination/Pagination';
import { Tag } from '../../../../../components/Tag/Tag';

export const getStaticPaths: GetStaticPaths = async () => {
  const allTags = await getAllTags();
  let params = [];

  //Tagの種類に合わせてページを動的に追加・変化させる実装
  await Promise.all(
    allTags.map((tag: string) => {
      return getNumberOfPageByTag(tag).then((numberOfPageByTag: number) => {
        // ページが増えた際にpageの数を動的に生成
        for (let i = 1; i <= numberOfPageByTag; i++) {
          params.push({ params: { tag: tag, page: i.toString() } });
        }
      });
    })
  );

  return {
    paths: params,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const currentPage: string = context.params?.page.toString();
  const currentTag: string = context.params?.tag.toString();

  const upperCaseCurrentTag = currentTag.charAt(0).toUpperCase() + currentTag.slice(1);

  const posts = await getPostsByTagAndPage(upperCaseCurrentTag, parseInt(currentPage, 10));

  const numberOfPageByTag = await getNumberOfPageByTag(upperCaseCurrentTag);

  const allTags = await getAllTags();

  return {
    props: {
      posts,
      numberOfPageByTag,
      currentTag,
      allTags,
    },
    revalidate: 10, // revalidate: ISR設定を行うプロパティ (秒数を設定)
  };
};

const BlogTagPageList = ({ numberOfPageByTag, posts, currentTag, allTags }) => {
  // console.log(allPosts);
  return (
    <div className="container h-full w-full mx-auto ">
      <Head>
        <title>Notion-Blog</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container w-full mt-16"></main>
      <h1 className="text-5xl font-medium text-center mb-16">Notion Blog🚀</h1>
      <section className="sm:grid grid-cols-2 w-5/6 gap-3 mx-auto">
        {posts.map((post) => (
          <div key={post.id}>
            <SinglePost title={post.title} description={post.description} date={post.date} tags={post.tags} slug={post.slug} isPagenationPage={true} />
          </div>
        ))}
      </section>
      <Pagination numberOfPage={numberOfPageByTag} tag={currentTag} />
      <Tag tags={allTags} />
    </div>
  );
};

export default BlogTagPageList;
