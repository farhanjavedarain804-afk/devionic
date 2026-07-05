import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, Database, Cookie, Users, Globe, Bell, ServerCrash, Trash2, Mail, Fingerprint, Monitor } from "lucide-react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import ContentContainer from "@/components/ContentContainer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const cards = [
  { icon: Shield, title: "Strong Security", desc: "Industry-standard encryption and security practices" },
  { icon: Lock, title: "Strict No-Sell Policy", desc: "Your data is never sold, rented, or traded to anyone" },
  { icon: Eye, title: "Full Transparency", desc: "Complete visibility into what we collect and why" },
  { icon: Trash2, title: "Your Data, Your Rights", desc: "Access, correct, export, or delete your data anytime" },
  { icon: Database, title: "Minimal Collection", desc: "We only collect what is necessary for our services" },
  { icon: ServerCrash, title: "Breach Notification", desc: "You will be informed without undue delay after any incident" },
  { icon: Fingerprint, title: "Access Controls", desc: "Strict role-based access to sensitive information" },
  { icon: Globe, title: "Cross-Border Protection", desc: "Data stored locally with no unauthorized transfers" },
];

const Privacy = () => {
  const effectiveDate = "June 19, 2026";

  return (
    <Layout>
      <PageHero title="Privacy" highlight="Policy" subtitle="How we collect, use, protect, and manage your information." />

      <section className="py-12 bg-background">
        <ContentContainer variant="default">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((item, i) => (
              <motion.div key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="p-6 bg-card rounded-xl border border-border text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
                  <item.icon size={22} className="text-accent" />
                </div>
                <h3 className="font-semibold text-card-foreground text-sm mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </ContentContainer>
      </section>

      <section className="py-16 bg-secondary/50">
        <ContentContainer variant="prose" className="prose text-muted-foreground space-y-4">

          <p className="text-sm italic">Last Updated: <strong className="text-foreground">{effectiveDate}</strong></p>

          <p className="text-justify">Devionic (Private) Limited ("Devionic," "we," "us," or "our") is deeply committed to protecting the privacy, security, and integrity of your personal information. This Privacy Policy ("Policy") comprehensively describes how we collect, use, store, share, protect, and manage your data when you visit our website at www.devionic.com, create an account on our client portal, submit inquiries or requests for quotes, communicate with us through any channel, engage our professional services, or otherwise interact with us. This Policy has been crafted to align with internationally recognized data protection principles, including the GDPR's lawful, fair, and transparent processing principles, and to comply with applicable Pakistani legislation, in particular the Prevention of Electronic Crimes Act 2016 (PECA) and relevant telecommunications regulations. Where our practices are informed by these frameworks, we apply them in a manner appropriate to the services we provide.</p>

          {/* ── 1 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Database size={18} className="text-accent" /> 1. Information We Collect
          </h3>
          <p>We collect information in the following categories:</p>

          <p className="text-justify"><strong>(a) Information You Provide Directly:</strong> Full name, email address, phone number, company name, job title, business address, project requirements and specifications, inquiry details, feedback and testimonials, job applications and resumes, complaint descriptions and supporting documents, payment and billing information, login credentials (protected so that we have no access to your plaintext password), and any other information you voluntarily submit through our website forms, client portal, email, phone, WhatsApp, or any other communication channel.</p>

          <p className="text-justify"><strong>(b) Information Collected Automatically:</strong> IP address and approximate location, browser type and version, operating system, device type and screen resolution, pages visited, time spent on pages, referring URLs and navigation paths, click patterns and user interactions, search queries entered on our website, and technical identifiers such as HTTP headers and device fingerprints. This data is collected through cookies, local storage, server logs, and analytics tools.</p>

          <p className="text-justify"><strong>(c) Information from Third-Party Authentication:</strong> When you sign in using Google Sign-In, we receive your Google account identifier, email address, full name, and profile picture from Google's identity token. We do not receive your Google password. This information is used solely to create or authenticate your account.</p>

          <p className="text-justify"><strong>(d) Information from Third-Party Integrations:</strong> We may receive supplementary data from payment processors, email service providers, and analytics platforms as part of normal service operation. Each third party operates under its own independent privacy policy.</p>

          {/* ── 2 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Eye size={18} className="text-accent" /> 2. How We Use Your Information
          </h3>
          <p className="text-justify">We use the information we collect for the following legitimate purposes:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Service Delivery:</strong> Processing and fulfilling service requests, managing projects, communicating project updates, milestones, and deliverables, and providing ongoing technical support and maintenance.</li>
            <li><strong>Account Management:</strong> Creating and administering your client portal account, authenticating your identity, managing access permissions, and ensuring account security including trusted device verification and two-factor authentication.</li>
            <li><strong>Communication:</strong> Responding to your inquiries, sending project notifications and status updates, delivering important service announcements, and, with your explicit opt-in consent only, sending marketing materials, newsletters, and promotional content about new services or special offers.</li>
            <li><strong>Analytics &amp; Improvement:</strong> Analyzing website usage patterns, optimizing user experience, identifying performance bottlenecks, conducting A/B testing, and making data-driven improvements to our services and platform.</li>
            <li><strong>Security &amp; Fraud Prevention:</strong> Detecting, preventing, and responding to security threats, unauthorized access attempts, fraudulent activities, abuse of our platform, and potential cyber attacks. For these purposes we may record limited technical information related to your use of the service.</li>
            <li><strong>Legal Compliance:</strong> Complying with applicable laws, regulations, court orders, subpoenas, government directives, and regulatory requirements. We may disclose information when required by law or to protect our legal rights.</li>
            <li><strong>Business Operations:</strong> Generating aggregate, anonymized statistics and reports for internal business analysis, financial reporting, and strategic planning. These reports do not contain individually identifiable personal data.</li>
          </ul>
          <p className="text-justify">We do <strong>not</strong> sell, rent, lease, trade, barter, or otherwise monetize your personal information to any third party for marketing, advertising, or any commercial purpose whatsoever.</p>

          {/* ── 3 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Shield size={18} className="text-accent" /> 3. Data Storage and Security Measures
          </h3>
          <p className="text-justify">We implement a comprehensive, multi-layered security framework to protect your personal information from unauthorized access, alteration, disclosure, or destruction:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Encryption at Rest:</strong> Sensitive data stored in our databases is protected using industry-standard encryption.</li>
            <li><strong>Encryption in Transit:</strong> All data transmitted between your browser and our servers is protected by modern encrypted connections (HTTPS), helping ensure that data cannot be intercepted in transit.</li>
            <li><strong>Password Security:</strong> Passwords are protected using strong, one-way hashing techniques before storage. We have no access to your plaintext passwords. Google-authenticated accounts do not store any password.</li>
            <li><strong>Infrastructure Security:</strong> Our servers are hosted in secure, access-controlled data centers with appropriate physical and environmental safeguards.</li>
            <li><strong>Access Controls:</strong> Access to personal data is restricted on a strict need-to-know basis. Only authorized personnel with specific job functions may access sensitive information.</li>
            <li><strong>Authentication Security:</strong> We use multi-layer authentication, including two-factor authentication (2FA) and trusted device management, alongside protections against automated abuse and brute-force attacks.</li>
            <li><strong>Application Security:</strong> We apply industry-standard web security measures, including security headers, request validation, and rate limiting to protect against common web threats.</li>
            <li><strong>Audit Logging:</strong> We maintain logs of administrative actions and significant system events to support accountability and forensic review.</li>
            <li><strong>Regular Backups:</strong> We maintain encrypted backups to help protect against data loss from hardware failure, disasters, or other incidents.</li>
            <li><strong>Security Monitoring:</strong> We monitor our systems for suspicious activity, unauthorized access attempts, and potential vulnerabilities.</li>
            <li><strong>Continuous Improvement:</strong> We regularly review and update our security practices to address emerging threats and keep our protections current.</li>
          </ul>

          {/* ── 4 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Cookie size={18} className="text-accent" /> 4. Cookies and Tracking Technologies
          </h3>
          <p className="text-justify">Our website uses cookies and similar technologies for the following purposes:</p>
          <p className="text-justify"><strong>(a) Essential Cookies:</strong> Required for the website and client portal to function properly, including keeping you signed in, protecting against unauthorized requests, and remembering your preferences. These cannot be disabled without breaking core functionality.</p>
          <p className="text-justify"><strong>(b) Analytics Cookies:</strong> We may use analytics tools to collect anonymized, aggregated data about website traffic, user behavior, and performance metrics. Data collected may include pages visited, session duration, bounce rates, device types, and approximate geographic regions. IP addresses may be anonymized depending on configuration. You can manage these cookies through your browser settings or by using widely available opt-out tools provided by the relevant analytics vendor.</p>
          <p className="text-justify"><strong>(c) Functionality Cookies:</strong> Remember your preferences, language settings, and customization choices to provide a personalized experience across sessions.</p>
          <p className="text-justify"><strong>(d) Third-Party Cookies:</strong> When you sign in with Google, Google may set its own cookies as part of the authentication process, subject to Google's own privacy policy.</p>
          <p className="text-justify">You can manage and control cookies through your browser settings. Please note that disabling essential cookies may prevent the client portal from functioning properly. Most browsers allow you to refuse cookies, delete existing cookies, or alert you when a cookie is being set.</p>

          {/* ── 5 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Globe size={18} className="text-accent" /> 5. Data Sharing and Third-Party Disclosure
          </h3>
          <p className="text-justify">We do <strong>not</strong> sell, rent, or trade your personal information. We may share your information only in the following limited circumstances:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Service Providers:</strong> We engage trusted, vetted third-party service providers who assist us in operating our business (e.g., cloud hosting providers, email delivery services, payment processors, analytics platforms). We apply a structured trust model when sharing data with these providers: (i) we share only the minimum data necessary for the defined service; (ii) each provider is bound by a written agreement limiting processing to our documented instructions; (iii) providers are required to maintain appropriate technical and organizational security measures, and to support your rights (access, correction, deletion) as applicable; (iv) providers are prohibited from using your data for their own independent purposes.</li>
            <li><strong>Legal Requirements:</strong> We may disclose information when required by law, regulation, court order, subpoena, government directive, or other legal process. This includes responding to lawful requests from public authorities, law enforcement agencies, and regulatory bodies exercising their statutory powers.</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, corporate reorganization, asset sale, or bankruptcy, your personal information may be transferred as part of the transaction. We will notify you via email or a prominent website notice before your information becomes subject to a different privacy policy.</li>
            <li><strong>Consent:</strong> With your explicit, informed, and revocable consent, we may share specific information with third parties for purposes you have approved (e.g., co-branded services, partner integrations).</li>
            <li><strong>Protection of Rights:</strong> We may disclose information when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, prevent abuse, or respond to an emergency situation.</li>
          </ul>

          {/* ── 6 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Users size={18} className="text-accent" /> 6. Your Rights and Choices
          </h3>
          <p className="text-justify">You have the following rights regarding your personal information:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Right of Access:</strong> You may request a complete copy of all personal information we hold about you by contacting us at info@devionic.com. We will respond within 30 days.</li>
            <li><strong>Right to Correction:</strong> You may request correction of any inaccurate, incomplete, or outdated personal information at any time through your client portal account settings or by contacting us directly.</li>
            <li><strong>Right to Deletion:</strong> You may request permanent deletion of your personal information and account. We will process such requests within 30 days, except where retention is required by law, necessary for pending legal proceedings, or needed to complete an active service engagement. Upon deletion, your data is removed from our active systems in accordance with our data handling procedures.</li>
            <li><strong>Right to Data Portability:</strong> You may request your data in a structured, machine-readable format (JSON or CSV) suitable for transfer to another service provider.</li>
            <li><strong>Right to Withdraw Consent:</strong> Where our processing of your data is based on your consent, you may withdraw that consent at any time by contacting us or adjusting your account settings. Withdrawal of consent does not affect the lawfulness of processing carried out prior to the withdrawal.</li>
            <li><strong>Right to Object:</strong> You may object to the processing of your personal information for direct marketing purposes, analytics profiling, or any other legitimate interest-based processing. We will cease such processing upon receiving your objection unless we have compelling legitimate grounds that override your interests.</li>
            <li><strong>Right to Restrict Processing:</strong> You may request that we restrict the processing of your personal information in certain circumstances, such as when the accuracy of the data is contested or when you have objected to processing.</li>
            <li><strong>Right to Lodge a Complaint:</strong> You have the right to lodge a formal complaint with the relevant supervisory authority or data protection regulator if you believe our processing of your data violates applicable data protection laws.</li>
          </ul>

          {/* ── 7 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Monitor size={18} className="text-accent" /> 7. Data Retention
          </h3>
          <p className="text-justify">We retain personal information only for as long as necessary to fulfill the purposes outlined in this Policy, unless a longer retention period is required or permitted by law. Specifically: active client account data is retained for the duration of the business relationship plus a reasonable period thereafter; project records and deliverables are retained for an appropriate period after project completion for warranty and reference purposes; financial and billing records are retained as required by applicable tax and accounting regulations; system and security logs are retained only for as long as needed for security and operational purposes; aggregated and anonymized analytics data is subject to long-term anonymized analytics retention for trend analysis and carries no link back to an identifiable individual. When the retention period expires, data is securely deleted or anonymized in accordance with our data handling procedures.</p>

          {/* ── 8 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <ServerCrash size={18} className="text-accent" /> 8. Data Breach Notification
          </h3>
          <p className="text-justify">In the event of a data breach or security incident that compromises the confidentiality, integrity, or availability of your personal information, we will: (a) promptly investigate the incident and assess its scope and impact; (b) notify affected individuals via email without undue delay (typically within 72 hours where feasible), in line with recognized breach notification practices; (c) describe the nature of the data compromised, the likely consequences, and the measures we have taken or will take to address the breach; (d) report the incident to relevant regulatory authorities as required by applicable law; (e) conduct a thorough post-incident review and implement additional safeguards to prevent recurrence.</p>

          {/* ── 9 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Users size={18} className="text-accent" /> 9. Children's Privacy
          </h3>
          <p className="text-justify">Our services and website are not directed at individuals under the age of 16. We do not knowingly collect, store, or process personal information from children. If we discover that we have inadvertently collected personal data from a child under 16, we will take immediate steps to delete such information from our servers. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at info@devionic.com and we will take appropriate action.</p>

          {/* ── 10 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Globe size={18} className="text-accent" /> 10. International Data Transfers
          </h3>
          <p className="text-justify">Our primary data storage infrastructure is located within Pakistan. In the course of providing services, your data may be transferred to or accessed from servers located in other jurisdictions when we rely on third-party services such as analytics, cloud hosting, or email delivery providers. We select service providers that maintain appropriate technical and organizational safeguards for the personal data they process on our behalf, and we rely on them only where adequate data protection standards are in place. By using our services, you consent to the transfer of your information to these jurisdictions, understanding that the receiving parties maintain adequate data protection standards.</p>

          {/* ── 11 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Bell size={18} className="text-accent" /> 11. Marketing Communications
          </h3>
          <p className="text-justify">We will only send you marketing communications, promotional materials, newsletters, or product announcements if you have explicitly opted in to receive them. You can opt out at any time by: clicking the "unsubscribe" link at the bottom of any marketing email; adjusting your communication preferences in your client portal account settings; or sending a written request to info@devionic.com with the subject line "Unsubscribe." We will honor your opt-out request within 10 business days. Even if you opt out of marketing communications, we will continue to send you service-related notifications (project updates, security alerts, account verification emails, and billing statements) as these are essential to the services you have engaged.</p>

          {/* ── 12 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <FileText size={18} className="text-accent" /> 12. Changes to This Privacy Policy
          </h3>
          <p className="text-justify">We reserve the right to update, modify, or amend this Privacy Policy at any time to reflect changes in our practices, technologies, legal requirements, or regulatory landscape. When we make material changes, we will: (a) update the "Last Updated" date at the top of this page; (b) post a prominent notice on our website for a minimum of 30 days; (c) notify registered clients via email. Your continued use of our website or services after the updated Policy becomes effective constitutes your acceptance of the revised terms. We encourage you to review this Policy periodically to stay informed about how we protect your information.</p>

          {/* ── 13 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Mail size={18} className="text-accent" /> 13. Contact Us
          </h3>
          <p className="text-justify">If you have any questions, concerns, complaints, or requests regarding this Privacy Policy, our data practices, or your personal information, please contact our Data Protection Officer through any of the following channels:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Email:</strong> info@devionic.com</li>
            <li><strong>Phone:</strong> +92-317-7121841</li>
            <li><strong>WhatsApp:</strong> +92-317-7121841</li>
            <li><strong>Website:</strong> <a href="https://www.devionic.com" className="text-accent hover:underline">www.devionic.com</a></li>
            <li><strong>Head Office:</strong> Devionic Multan Road Chowk Azam, Tehsil &amp; District Layyah, Punjab, Pakistan &ndash; Postal Code 31450</li>
          </ul>
          <p className="text-justify">We will acknowledge receipt of your inquiry within 2 business days and provide a substantive response within 30 calendar days. In cases of exceptional complexity, we may extend this period by a further 30 days, in which case we will notify you of the extension and the reasons for it.</p>

        </ContentContainer>
      </section>
    </Layout>
  );
};

export default Privacy;
