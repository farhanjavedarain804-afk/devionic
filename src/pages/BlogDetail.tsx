import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, CalendarDays } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import ContentContainer from "@/components/ContentContainer";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blogPosts";

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <Layout>
      <SEO 
        title={post.seoTitle || post.title} 
        description={post.seoDescription || post.excerpt}
        canonical={`/blog/${post.slug}`}
      />
      
      <div className="pt-32 pb-10 bg-background">
        <ContentContainer variant="prose">
          <Link to="/blog">
            <Button variant="ghost" className="mb-8 hover:text-cyan pl-0 hover:bg-transparent -ml-4">
              <ArrowLeft size={16} className="mr-2" /> Back to Blog
            </Button>
          </Link>
          
          <div className="mb-10">
            <span className="bg-cyan/10 text-cyan text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 inline-block">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <User size={16} className="text-cyan" />
                {post.author}
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-cyan" />
                {post.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-cyan" />
                5 min read
              </div>
            </div>
          </div>
        </ContentContainer>
      </div>

      <div className="w-full h-[40vh] md:h-[60vh] max-h-[600px] mb-16 relative">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <section className="pb-20 bg-background">
        <ContentContainer variant="prose">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="prose prose-lg dark:prose-invert prose-headings:text-foreground prose-a:text-cyan hover:prose-a:text-accent prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Share this article</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="sm" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${post.title}`, '_blank')}>Twitter</Button>
              <Button variant="outline" size="sm" onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=${post.title}`, '_blank')}>LinkedIn</Button>
            </div>
          </div>
        </ContentContainer>
      </section>
    </Layout>
  );
};

export default BlogDetail;
