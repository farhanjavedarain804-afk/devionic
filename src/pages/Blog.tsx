import { motion } from "framer-motion";
import { Clock, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import ContentContainer from "@/components/ContentContainer";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blogPosts";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const Blog = () => {
  return (
    <Layout>
      <SEO 
        title="Blog & Insights" 
        description="Read the latest news, insights, and technical articles from Devionic's team of experts."
        canonical="/blog"
      />
      <PageHero 
        title="Blog &" 
        highlight="Insights" 
        subtitle="Latest news, tech trends, and professional insights from our experts." 
      />

      <section className="py-20 bg-background">
        <ContentContainer variant="default">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
              <motion.div
                key={post.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-cyan/30 transition-all group flex flex-col"
              >
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-navy-dark/20 group-hover:bg-transparent transition-colors z-10" />
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-cyan text-navy-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-cyan" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-cyan" />
                      {post.author}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-cyan transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-muted-foreground line-clamp-3 mb-6 flex-grow">
                    {post.excerpt}
                  </p>
                  
                  <Link to={`/blog/${post.slug}`} className="w-full mt-auto">
                    <Button variant="outline" className="w-full group-hover:bg-cyan group-hover:text-navy-dark group-hover:border-cyan transition-colors">
                      Read Article <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </ContentContainer>
      </section>
    </Layout>
  );
};

export default Blog;
