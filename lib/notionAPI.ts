import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { NUMBER_OF_POSTS_PER_PAGE } from '../constants/constants';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

export const getAllPosts = async () => {
  const posts = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    page_size: 100,
    filter: {
      property: 'Published',
      checkbox: {
        equals: true,
      },
    },
    sorts: [{ property: 'Date', direction: 'descending' }], //日時によって降順に並び替える実装
  });

  const allPosts = posts.results;

  return allPosts.map((post) => {
    return getPageMetaData(post);
  });
};

const getPageMetaData = (post) => {
  const getTags = (tags) => {
    const allTags = tags.map((tag) => {
      return tag.name;
    });

    return allTags;
  };

  return {
    id: post.id,
    title: post.properties.Name.title[0].plain_text,
    description: post.properties.Description.rich_text[0].plain_text,
    date: post.properties.Date.date.start,
    slug: post.properties.Slug.rich_text[0].plain_text,
    tags: getTags(post.properties.Tags.multi_select),
  };
};

export const getSinglePost = async (slug) => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    filter: {
      property: 'Slug',
      formula: {
        string: {
          equals: slug,
        },
      },
    },
  });

  const page = response.results[0];
  const metadata = getPageMetaData(page);
  // console.log(metadata)
  const mdBlocks = await n2m.pageToMarkdown(page.id);
  const mdString = n2m.toMarkdownString(mdBlocks);
  console.log(mdString);

  return {
    metadata,
    markdown: mdString,
  };
};

// Topページ用記事の取得 (4つの記事を取得)
export const getPostsForTopPage = async (pageSize: number) => {
  const allPosts = await getAllPosts();
  const fourPosts = allPosts.slice(0, pageSize);

  return fourPosts;
};

//ページ番号に応じた記事の取得
export const getPostsByPage = async (page: number) => {
  const allPosts = await getAllPosts();

  const startIndex = (page - 1) * NUMBER_OF_POSTS_PER_PAGE; //NUMBER_OF_POSTS_PER_PAGEは./constants/constants.ts内に1ページで何記事入れるかを指定できる
  const endIndex = startIndex + NUMBER_OF_POSTS_PER_PAGE;
  return allPosts.slice(startIndex, endIndex);
};

export const getNumberOfPages = async () => {
  const allPosts = await getAllPosts();
  return Math.floor(allPosts.length / NUMBER_OF_POSTS_PER_PAGE) + (allPosts.length % NUMBER_OF_POSTS_PER_PAGE > 0 ? 1 : 0); // ページにあまりが出たら1を返し、余が出なければ0を返す三項演算子を作成
};

// Tagを用いてフィルタリングできる機能の実装
export const getPostsByTagAndPage = async (tagName: string, page: number) => {
  const allPosts = await getAllPosts();
  const posts = allPosts.filter((post) => post.tags.find((tag: string) => tag === tagName));

  const startIndex = (page - 1) * NUMBER_OF_POSTS_PER_PAGE; //NUMBER_OF_POSTS_PER_PAGEは./constants/constants.ts内に1ページで何記事入れるかを指定できる
  const endIndex = startIndex + NUMBER_OF_POSTS_PER_PAGE;

  return posts.slice(startIndex, endIndex);
};

// 選択したタグの動的ページを実装
export const getNumberOfPageByTag = async (tagName: string) => {
  const allPosts = await getAllPosts();
  const posts = allPosts.filter((post) => post.tags.find((tag: string) => tag === tagName));
  return Math.floor(posts.length / NUMBER_OF_POSTS_PER_PAGE) + (posts.length % NUMBER_OF_POSTS_PER_PAGE > 0 ? 1 : 0); // ページにあまりが出たら1を返し、余が出なければ0を返す三項演算子を作成
};

//全てのタグを取得するAPI
export const getAllTags = async () => {
  const allPosts = await getAllPosts();

  const allTagssDuplicationLists = allPosts.flatMap((post) => post.tags);
  const set = new Set(allTagssDuplicationLists);
  const allTagsList = Array.from(set);

  return allTagsList;
};
