import { motion } from "framer-motion";
import { Target, Eye, Heart, Users } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import ContentContainer from "@/components/ContentContainer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const values = [
  { icon: Target, title: "Innovation", desc: "We embrace cutting-edge technologies to deliver future-ready solutions." },
  { icon: Eye, title: "Transparency", desc: "Honest communication and clear processes at every step." },
  { icon: Heart, title: "Client Focus", desc: "Your success is our priority. We build relationships, not just software." },
  { icon: Users, title: "Collaboration", desc: "Working together to achieve extraordinary results." },
];

const About = () => {
  return (
    <Layout>
      <SEO 
        title="About Us" 
        description="Learn more about Devionic (Private) Limited, our vision, mission, and the professional team behind our innovative IT solutions."
        canonical="/about"
      />
      <PageHero title="About" highlight="Devionic" subtitle="Inspiring Innovation Digitally since day one." />

      {/* Introduction */}
      <section className="py-20 bg-background">
        <ContentContainer variant="prose">
          <SectionHeading subtitle="Who We Are" title="Your Technology Partner" />
          <div className="prose prose-lg mx-auto text-muted-foreground space-y-4">
            <p>
              Devionic (Private) Limited is a leading technology and digital transformation company headquartered in Pakistan. We specialize in delivering innovative software solutions, web and mobile application development, artificial intelligence AI automation, cloud services, digital marketing, cybersecurity, and enterprise technology solutions tailored to the evolving needs of modern businesses.
            </p>
            <p>
              Driven by innovation, excellence, and a customer-centric approach, our team of skilled professionals combines technical expertise with strategic thinking to create scalable, secure, and future-ready digital solutions. We partner with startups, small and medium-sized businesses, enterprises, and government organizations to help them accelerate growth, optimize operations, and achieve sustainable success in an increasingly digital world.
            </p>
            <p>
              Founded with a vision to empower businesses through technology and contribute to Pakistan's digital advancement, Devionic has established itself as a trusted technology partner across diverse industries. Our commitment to quality, innovation, and continuous improvement enables us to deliver exceptional results that not only meet business objectives but create lasting value and competitive advantage for our clients.
            </p>
          </div>
        </ContentContainer>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-secondary/50">
        <ContentContainer variant="default">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={0}
              className="bg-card rounded-2xl p-10 border border-border/40 hover:border-cyan/30 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan/20 to-blue-500/20 flex items-center justify-center mb-6">
                <Eye size={28} className="text-cyan" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To be the leading digital innovation partner for businesses worldwide, empowering growth through technology excellence.
              </p>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={1}
              className="bg-card rounded-2xl p-10 border border-border/40 hover:border-cyan/30 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan/20 to-blue-500/20 flex items-center justify-center mb-6">
                <Target size={28} className="text-cyan" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To deliver innovative, reliable, and affordable digital solutions that help businesses thrive in an ever-evolving technological landscape.
              </p>
            </motion.div>
          </div>
        </ContentContainer>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-background">
        <ContentContainer variant="default">
          <SectionHeading subtitle="Core Values" title="What Drives Us" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp}
                className="text-center p-8 rounded-2xl border border-border/40 bg-card hover:border-cyan/30 transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan/20 to-blue-500/20 flex items-center justify-center">
                  <v.icon size={28} className="text-cyan" />
                </div>
                <h3 className="font-semibold text-card-foreground text-lg mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </ContentContainer>
      </section>
      <section className="py-20 bg-secondary/50">
        <ContentContainer variant="default" className="text-center">
          <SectionHeading subtitle="Our Location" title="Visit Us" description="Head Office-Devionic Multan Road Chowk Azam, Tehsil & District Layyah, Punjab, Pakistan Postal Code 31450" />
          <div className="max-w-4xl mx-auto rounded-xl overflow-hidden border border-border">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54740.44!2d70.94!3d30.96!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39260a1c3f3b5c7d%3A0x2c7e5e1e1e1e1e1e!2sLayyah%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1"
              width="100%" height="400" style={{ border: 0 }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" title="Devionic Location"
            />
          </div>
        </ContentContainer>
      </section>
    </Layout>
  );
};

export default About;
