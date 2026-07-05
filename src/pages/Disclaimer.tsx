import { motion } from "framer-motion";
import { AlertTriangle, Shield, FileText, Scale, Globe, AlertCircle, Code, Ban, MonitorSmartphone, Mail, Users } from "lucide-react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import ContentContainer from "@/components/ContentContainer";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }),
};

const cards = [
  { icon: AlertTriangle, title: "General Notice", desc: "All information is for general purposes only" },
  { icon: Shield, title: "No Guarantees", desc: "Content provided as general information without assurances" },
  { icon: Globe, title: "External Links", desc: "We are not responsible for third-party content" },
  { icon: Scale, title: "Legal Compliance", desc: "Subject to the laws of Pakistan" },
  { icon: Code, title: "Technical Disclaimer", desc: "Service availability subject to real-world conditions" },
  { icon: MonitorSmartphone, title: "Device Compatibility", desc: "Experience may vary across devices and browsers" },
  { icon: Ban, title: "Limitation of Liability", desc: "Liability capped at paid amount or USD 100, whichever is greater" },
  { icon: AlertCircle, title: "Evolving Content", desc: "Website content is subject to change without notice" },
];

const Disclaimer = () => {
  const effectiveDate = "June 19, 2026";

  return (
    <Layout>
      <PageHero title="Legal" highlight="Disclaimer" subtitle="Important legal information about using our website and services." />

      <section className="py-12 bg-background">
        <ContentContainer variant="default">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {cards.map((item, i) => (
              <motion.div key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
                className="p-6 bg-card rounded-xl border border-border text-center">
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

          <p className="text-justify">This Legal Disclaimer ("Disclaimer") applies to the website www.devionic.com and its associated subdomains (the "Website"), the Devionic client portal, all associated web pages, mobile applications, software products, and all services provided by Devionic (Private) Limited ("Devionic," "we," "us," or "our"), a company registered under the laws of Pakistan. By accessing, browsing, or using any part of the Website or our services, you acknowledge that you have read and understand this Disclaimer. By continuing to use the Website or our services, you accept its terms. If you do not agree, you should discontinue use of the Website and services.</p>

          {/* ── 1 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <AlertTriangle size={18} className="text-accent" /> 1. General Information Disclaimer
          </h3>
          <p className="text-justify">All information, content, materials, products, services, graphics, descriptions, pricing, specifications, case studies, testimonials, and other data published on the Website are provided for <strong>general informational and illustrative purposes only</strong>. While we strive to present information that is accurate, current, and reliable, Devionic does not guarantee the accuracy, completeness, or timeliness of any information on the Website. The inclusion of any information on the Website does not constitute a recommendation, endorsement, or solicitation by Devionic. Users should not rely solely on the information presented here and should conduct their own independent verification, due diligence, and professional consultation before making any business, financial, legal, or technical decisions based on content found on this Website.</p>

          {/* ── 2 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Globe size={18} className="text-accent" /> 2. External Links and Third-Party Content
          </h3>
          <p className="text-justify">The Website may contain hyperlinks, references, or pointers to other websites, platforms, applications, or content belonging to or originating from third parties that are not owned, operated, or controlled by Devionic. These external links are provided solely for the convenience and reference of our users. Devionic does not endorse or take responsibility for the content, accuracy, legality, or any other aspect of any third-party website or content accessible through the Website. The inclusion of any external link does <strong>not imply</strong> any form of partnership, affiliation, endorsement, sponsorship, or recommendation by Devionic. You access and use third-party websites at your own risk, and Devionic is not liable for any damage, loss, or expense arising from your use of or reliance on any third-party website or its content. We recommend that you review the terms of use and privacy policies of any third-party website you visit through links on our Website.</p>

          {/* ── 3 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <AlertCircle size={18} className="text-accent" /> 3. Professional Advice Disclaimer
          </h3>
          <p className="text-justify">The Website, its content, and any information provided through our services do <strong>not constitute professional advice</strong> of any kind, including but not limited to legal advice, financial advice, accounting advice, tax advice, investment advice, medical advice, engineering advice, cybersecurity consulting, or any other form of regulated professional advice. The information is provided solely for general informational and educational purposes and should not be treated as a substitute for obtaining professional advice from a qualified, licensed, and competent professional in the relevant field. Devionic is not a licensed law firm, financial institution, accounting practice, medical provider, or cybersecurity certification authority, and no professional-client relationship of any kind is created between Devionic and any user through the use of the Website or the provision of general information. Users should not act or refrain from acting based solely on information found on the Website without first seeking appropriate professional counsel. Devionic expressly disclaims all liability for any actions taken or not taken based on the general information provided on the Website.</p>

          {/* ── 4 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Code size={18} className="text-accent" /> 4. Technical and Performance Disclaimer
          </h3>
          <p className="text-justify">Devionic does not warrant that: (a) the Website will be available at all times or uninterrupted; (b) any defects, errors, bugs, or inaccuracies in the Website will be corrected; (c) the Website will meet your specific requirements, expectations, or intended purposes; (d) the results obtained from the use of the Website, client portal, or any of our software products will be accurate, reliable, or satisfactory; (e) the operation of the Website, its servers, or its underlying infrastructure will be immune to unauthorized access or capable of handling all traffic volumes without degradation. The Website, client portal, and all associated software are provided on an "as available" basis. Temporary interruptions may occur due to scheduled or unscheduled maintenance, system upgrades, server migrations, network outages, power failures, or circumstances beyond our reasonable control. We will endeavor to provide reasonable advance notice of planned maintenance through our communication channels and work to restore service promptly when interruptions occur. Devionic reserves the right to modify, suspend, discontinue, or terminate the Website or any part thereof at any time without liability.</p>

          {/* ── 5 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <MonitorSmartphone size={18} className="text-accent" /> 5. Device and Browser Compatibility Disclaimer
          </h3>
          <p className="text-justify">The Website is designed and optimized for modern web browsers including Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, and their respective mobile versions. The appearance, functionality, performance, and user experience of the Website may vary across different devices, operating systems, browsers, screen resolutions, network conditions, and configurations. We do not guarantee that the Website will function identically or optimally on all devices or browser combinations, including older or unsupported browser versions. Certain features, animations, or interactive elements may not be available on devices or browsers that do not support modern web standards (HTML5, CSS3, ES2020+, WebAssembly). Devionic is not responsible for any degradation of experience, loss of functionality, or display issues arising from the use of unsupported or outdated technology.</p>

          {/* ── 6 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <AlertCircle size={18} className="text-accent" /> 6. Errors, Inaccuracies, and Omissions
          </h3>
          <p className="text-justify">While Devionic has made every reasonable effort to ensure that all information, data, specifications, pricing, and content displayed on the Website is accurate, current, and obtained from reliable sources, we do <strong>not</strong> warrant the accuracy, reliability, completeness, or timeliness of any such information. Typographical errors, inaccuracies, omissions, outdated information, or technical inaccuracies may occur despite our best efforts. Devionic reserves the right to correct any errors, inaccuracies, or omissions at any time without prior notice and without incurring any liability for such corrections. We also reserve the right to update, modify, change, replace, or remove any content, features, functionality, or pages of the Website at any time without notice. The information on the Website is not intended to be and should not be relied upon as the sole source of truth for making any purchasing decisions, project planning, or business commitments.</p>

          {/* ── 7 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <FileText size={18} className="text-accent" /> 7. Intellectual Property Disclaimer
          </h3>
          <p className="text-justify">All content on the Website, including but not limited to text, articles, graphics, logos, icons, images, photographs, audio clips, video clips, digital downloads, data compilations, software code, page layout, underlying code, and the overall design and appearance of the Website ("Content"), is the exclusive property of Devionic (Private) Limited or its content suppliers and is protected by Pakistani and international copyright, trademark, patent, trade secret, and other intellectual property laws. Unauthorized use, reproduction, modification, distribution, transmission, republication, display, performance, licensing, creation of derivative works from, sale, rental, lease, or exploitation of any Content, in whole or in part, without the express prior written consent of Devionic, is strictly prohibited and may constitute a violation of applicable intellectual property laws. The Devionic name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Devionic (Private) Limited. No license, right, or interest in any trademark, trade name, or service mark of Devionic is granted through the use of the Website.</p>

          {/* ── 8 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Shield size={18} className="text-accent" /> 8. Fair Use Disclaimer
          </h3>
          <p className="text-justify">This Website may contain references to, quotations from, excerpts of, or discussions about copyrighted material, trademarks, proprietary technologies, third-party products, open-source software, industry standards, publicly available research papers, news articles, and other works that are the property of their respective owners. Such references are made solely for legitimate informational, educational, illustrative, and commentary purposes, and Devionic believes that these uses constitute fair use or fair dealing under applicable copyright laws. No content on this Website should be construed as claiming ownership of, or diminishing the rights of, any third-party intellectual property holder. If you are the owner of any intellectual property referenced on this Website and believe the reference constitutes an infringement, please contact us at info@devionic.com and we will promptly review and address your concern, including removing or modifying the referenced material if warranted.</p>

          {/* ── 9 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Ban size={18} className="text-accent" /> 9. Limitation of Liability
          </h3>
          <p className="text-justify"><strong>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, DEVIONIC (PRIVATE) LIMITED, ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, CONTRACTORS, SUCCESSORS, AND ASSIGNS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</strong>, including but not limited to: loss of profits, revenue, data, business opportunities, or goodwill; business interruption or operational downtime; costs of procurement of substitute goods or services; or unauthorized access to, alteration, or loss of data. This exclusion applies regardless of the legal theory, whether based on contract, tort (including negligence), statutory law, or any other basis, even if Devionic has been advised of the possibility of such damages. If the applicable jurisdiction does not allow the exclusion or limitation of liability for consequential or incidental damages, our liability shall be limited to the fullest extent permitted by applicable law. In any event, Devionic's total aggregate liability arising out of or related to your use of the Website shall not exceed the greater of: (i) the amount you have actually paid to Devionic for services, or (ii) one hundred United States dollars (USD 100.00).</p>

          {/* ── 10 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <AlertCircle size={18} className="text-accent" /> 10. User-Generated Content Disclaimer
          </h3>
          <p className="text-justify">The Website may allow users to submit, post, upload, transmit, or otherwise make available content including but not limited to: testimonials, reviews, feedback, comments, project requirements, and support tickets ("User Content"). Devionic does not endorse, guarantee, or assume responsibility for the accuracy, reliability, legality, or intellectual property compliance of any User Content. By submitting User Content, you represent and warrant that you own or have the necessary rights, licenses, consents, and permissions to use and authorize Devionic to use, reproduce, modify, publish, and display such content in connection with our services. Devionic reserves the right to monitor, review, edit, or remove any User Content at its sole discretion without notice if it is found to violate these Disclaimer terms, applicable law, or our community standards.</p>

          {/* ── 11 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Users size={18} className="text-accent" /> 11. User Responsibility
          </h3>
          <p className="text-justify">You are responsible for your own use of the Website and services, including but not limited to: ensuring that your use complies with all applicable local, national, and international laws and regulations; maintaining the security of your account credentials and any personal devices used to access our services; verifying the accuracy and suitability of any information obtained from the Website before relying on it for business, financial, legal, or technical decisions; ensuring that any content or materials you submit do not infringe upon the rights of any third party; and using the Website in a manner that does not harm, overload, or impair our infrastructure. Devionic is not responsible for any loss or damage resulting from your failure to fulfill these responsibilities.</p>

          {/* ── 12 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Scale size={18} className="text-accent" /> 12. Indemnification
          </h3>
          <p className="text-justify">You agree to indemnify, defend, and hold harmless Devionic (Private) Limited, its directors, officers, employees, agents, and affiliates from and against any and all claims, demands, causes of action, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees and court costs) arising out of or related to: (a) your access to or use of the Website; (b) your violation of any term or condition of this Disclaimer or any applicable agreement with Devionic; (c) your violation of any applicable law or regulation; (d) any content you submit, post, upload, or transmit through the Website; (e) your infringement upon or violation of any intellectual property rights, privacy rights, proprietary rights, or any other rights of any person or entity.</p>

          {/* ── 13 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Globe size={18} className="text-accent" /> 13. Governing Law and Jurisdiction
          </h3>
          <p className="text-justify">This Disclaimer shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any legal action, proceeding, or dispute arising out of or relating to this Disclaimer shall be subject to the exclusive jurisdiction of the competent courts in District Layyah, Punjab, Pakistan. You agree to submit to the personal jurisdiction of such courts for the resolution of any such disputes. Any claims not asserted within one (1) year of the event giving rise to the claim shall be permanently barred.</p>

          {/* ── 14 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <FileText size={18} className="text-accent" /> 14. Severability and Survivability
          </h3>
          <p className="text-justify">If any provision of this Disclaimer is found by a court of competent jurisdiction to be invalid, illegal, or unenforceable, such provision shall be modified or severed to the minimum extent necessary, and the remaining provisions shall continue in full force and effect. The provisions of this Disclaimer that by their nature should survive termination or expiration (including but not limited to limitation of liability, indemnification, intellectual property rights, and governing law) shall survive regardless of the termination of any agreement or use of the Website.</p>

          {/* ── 15 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Mail size={18} className="text-accent" /> 15. Contact Information
          </h3>
          <p className="text-justify">For any questions, concerns, clarifications, or formal notices regarding this Legal Disclaimer, please contact us through any of the following channels:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Email:</strong> info@devionic.com</li>
            <li><strong>Phone:</strong> +92-317-7121841</li>
            <li><strong>WhatsApp:</strong> +92-317-7121841</li>
            <li><strong>Website:</strong> <a href="https://www.devionic.com" className="text-accent hover:underline">www.devionic.com</a></li>
            <li><strong>Head Office:</strong> Devionic Multan Road Chowk Azam, Tehsil &amp; District Layyah, Punjab, Pakistan &ndash; Postal Code 31450</li>
          </ul>

        </ContentContainer>
      </section>
    </Layout>
  );
};

export default Disclaimer;
