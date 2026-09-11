import { motion } from "framer-motion";
import { Clock, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import ContentContainer from "@/components/ContentContainer";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const blogPosts = [
  {
    id: 1,
    title: "The Future of AI in Enterprise Software",
    excerpt: "Discover how artificial intelligence is transforming the way businesses operate, from automated workflows to intelligent data analytics.",
    category: "Technology",
    date: "Sep 10, 2026",
    author: "Devionic Team",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "5 Essential Cyber Security Best Practices for 2026",
    excerpt: "Protect your business from emerging digital threats with these fundamental cybersecurity strategies that every organization must implement.",
    category: "Security",
    date: "Aug 28, 2026",
    author: "Security Team",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "Why Your Business Needs a Custom Web Application",
    excerpt: "Off-the-shelf software might not be enough. Learn how custom web development can streamline your unique business processes.",
    category: "Development",
    date: "Aug 15, 2026",
    author: "Development Team",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
  },
];

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
                  
                  <Button variant="outline" className="w-full mt-auto group-hover:bg-cyan group-hover:text-navy-dark group-hover:border-cyan transition-colors">
                    Read Article <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button variant="cyan" size="lg">Load More Articles</Button>
          </div>
        </ContentContainer>
      </section>
    </Layout>
  );
};

export default Blog;
