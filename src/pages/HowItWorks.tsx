import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MessageSquarePlus, Search, FileCheck, CreditCard, Code2, Rocket,
  ShieldCheck, ChevronDown, ChevronUp, ArrowRight, Mail, Phone,
  HelpCircle, Lock, CheckCircle2, Zap, Globe, Headphones,
  MonitorSmartphone, Palette, Bot, ShoppingCart, TrendingUp,
  Shield, Briefcase, Cloud, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import ContentContainer from "@/components/ContentContainer";
import SectionHeading from "@/components/SectionHeading";
import SEO from "@/components/SEO";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

/* ─── 1. Process Steps ─── */
const processSteps = [
  {
    icon: MessageSquarePlus,
    step: "01",
    title: "Service Request",
    description:
      "Visit our website and fill out the inquiry or quote request form, or contact us directly via WhatsApp, email, or phone. Tell us about your project, goals, and requirements.",
  },
  {
    icon: Search,
    step: "02",
    title: "Requirement Analysis",
    description:
      "Our team reviews your request in detail. We may schedule a free consultation call to understand your needs, scope, timeline, budget, and any technical constraints before preparing a proposal.",
  },
  {
    icon: FileCheck,
    step: "03",
    title: "Quotation & Agreement",
    description:
      "We provide a detailed project proposal or quotation outlining the scope of work, deliverables, milestones, timeline, pricing, and payment terms. Once you review and agree, we proceed to the next step.",
  },
  {
    icon: CreditCard,
    step: "04",
    title: "Secure Online Payment",
    description:
      "You make a payment through our secure online payment gateway. This could be an advance deposit or the first milestone payment as specified in the agreed proposal or invoice.",
  },
  {
    icon: Code2,
    step: "05",
    title: "Project Execution",
    description:
      "Our team starts working on your project following the agreed plan. You receive regular progress updates, demos, and can track milestones through your client portal dashboard.",
  },
  {
    icon: Rocket,
    step: "06",
    title: "Delivery & Ongoing Support",
    description:
      "Upon completion, deliverables are reviewed, tested, and handed over. Final payment is processed. We offer post-delivery support, maintenance packages, and retainers for continued partnership.",
  },
];

/* ─── 2. Business Model Services ─── */
const businessServices = [
  { icon: Code2, name: "Software Development" },
  { icon: Globe, name: "Website Development" },
  { icon: MonitorSmartphone, name: "Mobile App Development" },
  { icon: Bot, name: "AI Solutions" },
  { icon: Database, name: "CRM & ERP Systems" },
  { icon: Headphones, name: "WhatsApp Chatbots" },
  { icon: Cloud, name: "Cloud Solutions" },
  { icon: Palette, name: "UI/UX Design" },
  { icon: Zap, name: "Digital Transformation" },
  { icon: Shield, name: "Technical Support & Maintenance" },
  { icon: ShoppingCart, name: "E-commerce Solutions" },
  { icon: TrendingUp, name: "Digital Marketing & SEO" },
  { icon: Briefcase, name: "Brand & Content Strategy" },
  { icon: ShieldCheck, name: "Cyber Security" },
];

/* ─── 3. Payment Flow ─── */
const paymentFlow = [
  { step: 1, text: "Customer requests a service through our website or direct contact." },
  { step: 2, text: "Company reviews the requirements and prepares a proposal." },
  { step: 3, text: "A formal quotation or invoice is issued to the customer." },
  { step: 4, text: "Customer completes a secure online payment through the payment gateway." },
  { step: 5, text: "Payment is verified and confirmed by our finance team." },
  { step: 6, text: "Project execution begins according to the agreed timeline." },
  { step: 7, text: "Service is delivered upon completion and client approval." },
  { step: 8, text: "Invoice and receipt are provided to the customer for their records." },
];

/* ─── 4. Security Features ─── */
const securityFeatures = [
  {
    icon: Lock,
    title: "Encrypted Transactions",
    desc: "All payments are processed through a certified, PCI-compliant payment gateway with end-to-end encryption.",
  },
  {
    icon: ShieldCheck,
    title: "Data Protection",
    desc: "Your personal and financial information is handled in strict accordance with our Privacy Policy and applicable data protection laws.",
  },
  {
    icon: CheckCircle2,
    title: "Verified Processing",
    desc: "Every transaction is verified before project commencement, ensuring transparency and accountability at every step.",
  },
  {
    icon: Globe,
    title: "Industry Standards",
    desc: "We follow industry best practices for payment security, fraud prevention, and regulatory compliance.",
  },
];

/* ─── 5. FAQs ─── */
const faqs = [
  {
    question: "When do I need to pay?",
    answer:
      "Payment is required after you accept our proposal or receive an invoice. For most projects, we require an advance deposit of 30-50% before work begins, followed by milestone-based payments as the project progresses. The exact payment schedule is always clearly stated in your project proposal or quotation before you commit.",
  },
  {
    question: "Which payment methods are accepted?",
    answer:
      "We accept payments through our secure online payment gateway, which supports major debit cards, credit cards, bank transfers, and other digital payment methods available in your region. If you need an alternative payment method, please contact us at info@devionic.com and we will do our best to accommodate your request.",
  },
  {
    question: "Can I request a refund?",
    answer:
      "Yes, refund requests are handled on a case-by-case basis as outlined in our Terms, Conditions & Refund Policy. If no work has commenced on your project, your advance deposit is fully refundable (less non-recoverable payment-gateway fees). For projects already in progress, refunds are assessed pro-rata based on work completed. Please email info@devionic.com with the subject line 'Refund Request' and include your transaction details.",
  },
  {
    question: "How will I receive confirmation of my payment?",
    answer:
      "After your payment is successfully processed and verified, you will receive a confirmation email with your payment receipt and an updated invoice reflecting the payment. You can also view all your invoices and payment history at any time through your client portal dashboard.",
  },
  {
    question: "Who can I contact for support?",
    answer:
      "You can reach our support team through multiple channels: Email at info@devionic.com, Phone/WhatsApp at +92-317-7121841, or through the Complaint & Ticket system on our website. We typically respond within 2 business days and aim to resolve all inquiries within 7-10 business days.",
  },
  {
    question: "Is the payment gateway secure?",
    answer:
      "Yes. All online payments are processed through an authorized and certified payment gateway that complies with PCI-DSS (Payment Card Industry Data Security Standard) requirements. Your card details are never stored on our servers — they are handled directly by the payment processor. Additionally, all data transmitted between your browser and our website is protected by HTTPS encryption.",
  },
  {
    question: "What happens if I miss a payment deadline?",
    answer:
      "If a milestone or invoice payment is overdue by more than 14 days after our written notice, we may pause work on the project until the outstanding amount is settled. Late payments may accrue a late fee at 1.5% per month as outlined in our Terms & Conditions. If you anticipate any difficulty with a payment, please contact us proactively so we can discuss flexible arrangements.",
  },
];

const HowItWorks = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <Layout>
      <SEO
        title="How It Works"
        description="Learn how Devionic works — from service request to secure online payment and project delivery. A simple, transparent process for all our IT services."
        canonical="/how-it-works"
      />

      {/* ═══ 1. Hero Section ═══ */}
      <PageHero
        title="How It"
        highlight="Works"
        subtitle="A simple and secure process for requesting, purchasing, and receiving our IT services."
      />

      {/* ═══ 2. Our Process — 6 Steps ═══ */}
      <section className="py-16 bg-background">
        <ContentContainer variant="default">
          <SectionHeading
            subtitle="Step by Step"
            title="Our Process"
            description="From your initial inquiry to final delivery, here's exactly how we work together to bring your project to life."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processSteps.map((item, i) => (
              <motion.div
                key={item.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow group"
              >
                {/* Step badge */}
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-accent text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
                  {item.step}
                </div>

                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <item.icon size={26} className="text-accent" />
                </div>

                <h3 className="text-lg font-semibold text-card-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>

                {/* Connector arrow on desktop (not on last item per row) */}
                {(i < processSteps.length - 1) && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-accent/30">
                    <ArrowRight size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </ContentContainer>
      </section>

      {/* ═══ 3. Business Model ═══ */}
      <section className="py-16 bg-secondary/50">
        <ContentContainer variant="default">
          <SectionHeading
            subtitle="What We Offer"
            title="Our Business Model"
            description="Devionic (Private) Limited is a full-service IT company that delivers technology solutions to businesses worldwide."
          />

          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-muted-foreground text-justify leading-relaxed">
              Customers request services through our website, receive a detailed quotation or invoice, make
              a <strong className="text-foreground">secure online payment</strong> through our integrated
              payment gateway, and we deliver the agreed services on time and on budget. Our team of
              skilled professionals handles every project with precision, from concept to deployment and
              ongoing support.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {businessServices.map((service, i) => (
              <motion.div
                key={service.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-border text-center hover:shadow-md hover:border-accent/30 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <service.icon size={20} className="text-accent" />
                </div>
                <p className="text-card-foreground text-xs font-medium leading-tight">{service.name}</p>
              </motion.div>
            ))}
          </div>
        </ContentContainer>
      </section>

      {/* ═══ 4. Payment Gateway Use Case ═══ */}
      <section className="py-16 bg-background">
        <ContentContainer variant="default">
          <SectionHeading
            subtitle="Payment Gateway"
            title="How Payments Work"
            description="The payment gateway is used exclusively to collect payments for IT services offered by Devionic (Private) Limited."
          />

          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-muted-foreground text-justify leading-relaxed">
              When a customer decides to proceed with a service, they are issued a formal quotation or
              invoice. Payment is made online through our authorized, secure payment gateway. The
              gateway processes the transaction, the payment is verified by our team, and the project
              begins. Upon delivery, a final invoice and receipt are provided. The payment gateway is
              <strong className="text-foreground"> not used for any other purpose</strong> &mdash; it exists
              solely to facilitate payment collection for our professional IT services.
            </p>
          </div>

          {/* Flow timeline */}
          <div className="max-w-4xl mx-auto space-y-0">
            {paymentFlow.map((item, i) => (
              <motion.div
                key={item.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex gap-4 items-start"
              >
                {/* Number circle + connector line */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-full bg-accent text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  {i < paymentFlow.length - 1 && (
                    <div className="w-0.5 h-12 bg-accent/20 mt-1" />
                  )}
                </div>

                <div className="pt-1.5 pb-6">
                  <p className="text-card-foreground text-sm leading-relaxed">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ContentContainer>
      </section>

      {/* ═══ 5. Security & Trust ═══ */}
      <section className="py-16 bg-secondary/50">
        <ContentContainer variant="default">
          <SectionHeading
            subtitle="Your Safety Matters"
            title="Security & Trust"
            description="All online payments are processed securely through an authorized payment gateway, and your information is fully protected."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityFeatures.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="p-6 bg-card rounded-xl border border-border text-center hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <item.icon size={26} className="text-accent" />
                </div>
                <h3 className="font-semibold text-card-foreground text-sm mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 max-w-3xl mx-auto p-6 bg-card rounded-xl border border-accent/20 text-center">
            <p className="text-muted-foreground text-sm leading-relaxed">
              <Lock size={16} className="inline text-accent mr-1 -mt-0.5" />
              Your card details are <strong className="text-foreground">never stored on our servers</strong>.
              All sensitive payment data is handled directly by the certified payment processor in compliance
              with PCI-DSS standards. For complete details, please review our{" "}
              <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </ContentContainer>
      </section>

      {/* ═══ 6. FAQ Section ═══ */}
      <section className="py-16 bg-background">
        <ContentContainer variant="narrow">
          <SectionHeading
            subtitle="Common Questions"
            title="Frequently Asked Questions"
            description="Find answers to the most common questions about our process, payments, and services."
          />

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-xl border border-border overflow-hidden bg-card"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={18} className="text-accent shrink-0" />
                    <span className="font-medium text-card-foreground text-sm">{faq.question}</span>
                  </div>
                  {openFaq === i ? (
                    <ChevronUp size={18} className="text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-muted-foreground shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pl-[2.75rem]">
                        <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </ContentContainer>
      </section>

      {/* ═══ 7. Call to Action ═══ */}
      <section className="py-20 bg-navy-gradient">
        <ContentContainer variant="narrow" className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Your <span className="text-accent">Project</span>?
            </h2>
            <p className="text-primary-foreground/70 max-w-xl mx-auto mb-8 leading-relaxed">
              Whether you need a website, mobile app, AI solution, or complete digital transformation
              &mdash; our team is ready to help. Get a free consultation and quote today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary-foreground font-medium px-8">
                  Request a Quotation <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>

              <a href="https://wa.me/923177121841" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-8 shadow-md"
                >
                  <Phone size={16} className="mr-1" /> Chat on WhatsApp
                </Button>
              </a>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-primary-foreground/60 text-sm">
              <a href="mailto:info@devionic.com" className="flex items-center gap-2 hover:text-cyan transition-colors">
                <Mail size={16} /> info@devionic.com
              </a>
              <a href="tel:+923177121841" className="flex items-center gap-2 hover:text-cyan transition-colors">
                <Phone size={16} /> +92-317-7121841
              </a>
            </div>
          </motion.div>
        </ContentContainer>
      </section>
    </Layout>
  );
};

export default HowItWorks;
