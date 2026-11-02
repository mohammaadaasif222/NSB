import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS, BlogArticle } from "@/components/site/blog-content";

type Props = PageProps<"/blog/[slug]">;

export function generateStaticParams() {
  return BLOG_POSTS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) return { title: "Noida Insider | Noida Super Bazaar" };
  return {
    title: `${post.title} | Noida Insider`,
    description: post.description,
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) notFound();
  return <BlogArticle post={post} />;
}
