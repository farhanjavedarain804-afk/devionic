import { motion } from "framer-motion";
import { FileText, Scale, Shield, Handshake, Gavel, Users, CreditCard, Globe, Clock, Ban, AlertCircle, Mail, Lock, RotateCcw } from "lucide-react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import ContentContainer from "@/components/ContentContainer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const cards = [
  { icon: Scale, title: "Legally Binding", desc: "Enforceable agreement under Pakistani law" },
  { icon: Shield, title: "IP Protection", desc: "Your intellectual property is fully safeguarded" },
  { icon: Gavel, title: "Dispute Resolution", desc: "Clear process for handling disagreements" },
  { icon: Handshake, title: "Fair & Transparent", desc: "Balanced terms protecting both parties" },
  { icon: Users, title: "Professional Standards", desc: "Industry-grade service commitments" },
  { icon: CreditCard, title: "Clear Payments", desc: "Transparent billing with no hidden charges" },
  { icon: Globe, title: "Global Reach", desc: "Terms applicable to clients worldwide" },
  { icon: Clock, title: "Timely Delivery", desc: "Defined timelines with milestone tracking" },
];

const Terms = () => {
  const effectiveDate = "June 19, 2026";

  return (
    <Layout>
      <PageHero title="Terms, Conditions &" highlight="Refund Policy" subtitle="Please read these terms carefully before using our services." />

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

          <p className="text-justify">These Terms and Conditions ("Terms") govern your use of the website, client portal, services, and all interactions with Devionic (Private) Limited ("Devionic," "we," "us," or "our"), a company duly registered under the laws of Pakistan with its Head Office at Devionic Multan Road Chowk Azam, Tehsil &amp; District Layyah, Punjab, Pakistan &ndash; Postal Code 31450. By using our website at www.devionic.com and its associated subdomains, creating an account, or engaging our services, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you should discontinue use of our website and services.</p>

          {/* ── 1 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <FileText size={18} className="text-accent" /> 1. Definitions
          </h3>
          <p className="text-justify"><strong>"Client"</strong> refers to any individual, business entity, or organization that accesses our website, creates an account, submits an inquiry, or engages Devionic for professional services. <strong>"Services"</strong> refers to all IT, software, design, marketing, consulting, and ancillary services provided by Devionic. <strong>"Deliverables"</strong> means all tangible and intangible outputs produced by Devionic as part of the agreed scope of work. <strong>"Confidential Information"</strong> means any non-public information disclosed by either party, whether in written, oral, electronic, or any other form, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and circumstances of disclosure.</p>

          {/* ── 2 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Globe size={18} className="text-accent" /> 2. Scope of Services
          </h3>
          <p className="text-justify">Devionic provides a comprehensive range of professional IT services including, but not limited to: custom software and web development, mobile application development (iOS, Android, cross-platform), UI/UX design and prototyping, artificial intelligence and machine learning solutions, robotic process automation (RPA), digital marketing and SEO, social media management, graphic design and brand identity, video editing and motion graphics, e-commerce platform development and management, cyber security auditing and consulting, cloud infrastructure management, IT strategy consultancy, data analytics and business intelligence, technical documentation, API development and integration, content management system (CMS) customization, and DevOps engineering. The specific scope, deliverables, timelines, and pricing for each engagement shall be defined in a separate Statement of Work (SOW), project proposal, or service agreement executed between the parties.</p>

          {/* ── 3 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Users size={18} className="text-accent" /> 3. Account Registration and Client Portal
          </h3>
          <p className="text-justify">By registering an account on the Devionic client portal, you represent and warrant that: (a) all information provided during registration is true, accurate, current, and complete; (b) you are at least 18 years of age or have the legal capacity to enter into binding agreements; (c) you will maintain the security and confidentiality of your account credentials and will not share them with any third party; (d) you will promptly notify Devionic of any unauthorized use of your account or any other breach of security. You are solely responsible for all activities that occur under your account. Devionic reserves the right to suspend or terminate accounts that violate these Terms or are suspected of fraudulent or unauthorized activity without prior notice.</p>

          {/* ── 4 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Users size={18} className="text-accent" /> 4. Client Responsibilities
          </h3>
          <p className="text-justify">Clients are responsible for: providing accurate, complete, and timely information, content, assets, and materials required for project execution; granting necessary access to systems, servers, hosting environments, third-party accounts, APIs, and documentation as required by the project scope; responding to queries, feedback requests, and approvals within a reasonable timeframe as defined in the project agreement — failure to respond within 5 business days may be deemed acceptance and may result in timeline adjustments; ensuring that all materials provided to Devionic do not infringe upon the intellectual property rights or any other rights of any third party; and maintaining backups of their own data and systems independent of any backups provided by Devionic. Delays caused by the client's failure to fulfill these responsibilities may result in adjusted project timelines and additional charges at Devionic's standard rates.</p>

          {/* ── 5 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <CreditCard size={18} className="text-accent" /> 5. Payment Terms and Pricing
          </h3>
          <p className="text-justify">Payment terms are specified in individual project proposals, Statements of Work, or service agreements. Unless otherwise agreed in writing: (a) Devionic may require an upfront deposit of 30% to 50% of the total estimated project cost before commencing any work; (b) milestone-based payments are due within 7 calendar days of each milestone delivery and client acceptance; (c) final payment is due within 14 calendar days of project delivery and formal acceptance by the client; (d) late payments shall accrue a late fee at a rate of 2.5% per day on the outstanding balance from the due date until paid in full, to the extent permitted by applicable law; (e) all prices are quoted exclusive of applicable taxes, duties, or government levies, which shall be borne by the client unless explicitly stated otherwise; (f) Devionic reserves the right to suspend work on any project for which payment is overdue by more than 14 days after written notice; (g) invoices not contested in writing within 15 days of issuance shall be deemed accepted and payable in full. Refund requests are evaluated on a case-by-case basis and are subject to management approval. Deposits for commenced projects are non-refundable.</p>

          {/* ── 6 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Shield size={18} className="text-accent" /> 6. Intellectual Property Rights
          </h3>
          <p className="text-justify">All intellectual property rights in the Deliverables shall transfer to the Client upon receipt of full and final payment, unless otherwise specified in a written agreement between the parties. This transfer is subject to the following conditions: (a) Devionic retains ownership of all pre-existing proprietary tools, frameworks, libraries, codebases, methodologies, and trade secrets used in the development process; (b) Devionic retains a perpetual, non-exclusive, royalty-free right to use, reproduce, modify, and showcase any general knowledge, skills, ideas, concepts, techniques, and know-how acquired during the engagement; (c) Devionic retains the right to display completed projects in its portfolio, marketing materials, case studies, and social media channels unless a specific Non-Disclosure Agreement (NDA) has been executed prohibiting such use; (d) third-party software, open-source components, and licensed libraries incorporated into the Deliverables remain subject to their respective license terms and are not transferred to the Client; (e) the Client shall not remove, alter, or obscure any proprietary notices, credits, or watermarks embedded in the Deliverables by Devionic without prior written consent. Any work product created specifically for the Client that incorporates Devionic's proprietary components shall be licensed to the Client under a perpetual, non-transferable, non-exclusive license unless full ownership is explicitly granted in the project agreement.</p>

          {/* ── 7 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Lock size={18} className="text-accent" /> 7. Confidentiality and Non-Disclosure
          </h3>
          <p className="text-justify">Both parties agree to hold all Confidential Information received from the other party in strict confidence and shall not disclose, publish, or disseminate such information to any third party without the prior written consent of the disclosing party, except as required by law, regulation, or court order. The obligations of confidentiality shall survive the termination or expiration of these Terms or any project agreement for a period of three (3) years. In the event that a party is compelled by law or legal process to disclose Confidential Information, that party shall promptly notify the other party in writing before such disclosure, to the extent legally permissible. Each party shall use the same degree of care to protect the other party's Confidential Information as it uses to protect its own confidential information, but in no event less than reasonable care.</p>

          {/* ── 8 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Gavel size={18} className="text-accent" /> 8. Warranties, Representations, and Disclaimers
          </h3>
          <p className="text-justify">Devionic warrants and represents that: (a) all services shall be performed in a professional and workmanlike manner consistent with industry standards; (b) all Deliverables shall conform to the specifications and requirements agreed upon in the project documentation; (c) Devionic has the necessary skills, expertise, and resources to perform the services as described. Devionic provides a 30-day warranty period after project delivery, during which Devionic will correct, at no additional charge, any bugs, errors, or defects that materially affect the functionality of the Deliverables as specified and are reported in writing within this period. For the purpose of this warranty, a "bug" or "defect" means a deviation from the agreed specifications that impairs core functionality; feature requests, design preference changes, or behaviors consistent with the agreed specifications are not covered. This warranty does not cover issues arising from: (i) unauthorized modifications to the Deliverables by the Client or third parties; (ii) use of the Deliverables in a manner inconsistent with the documentation or agreed specifications; (iii) failure or malfunction of third-party software, servers, APIs, or infrastructure beyond Devionic's control; (iv) force majeure events as defined in these Terms. EXCEPT AS EXPRESSLY SET FORTH IN THIS SECTION, DEVIONIC DISCLAIMS ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. THE SERVICES AND DELIVERABLES ARE PROVIDED "AS IS" AND THE CLIENT ASSUMES ALL RISKS ASSOCIATED WITH THEIR USE.</p>

          {/* ── 9 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <AlertCircle size={18} className="text-accent" /> 9. Limitation of Liability
          </h3>
          <p className="text-justify">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL DEVIONIC (PRIVATE) LIMITED, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, CONTRACTORS, SUCCESSORS, OR ASSIGNS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, EXEMPLARY, OR AGGRAVATED DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF DATA, LOSS OF BUSINESS OPPORTUNITIES, BUSINESS INTERRUPTION, LOSS OF GOODWILL, REPUTATION DAMAGE, OR COST OF PROCUREMENT OF SUBSTITUTE SERVICES, ARISING OUT OF OR IN ANY WAY RELATED TO THESE TERMS, THE SERVICES, THE DELIVERABLES, OR THE WEBSITE, WHETHER BASED ON CONTRACT, TORT (INCLUDING NEGLIGENCE AND STRICT LIABILITY), STATUTORY LIABILITY, OR ANY OTHER LEGAL THEORY, EVEN IF DEVIONIC HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. DEVIONIC'S TOTAL AGGREGATE LIABILITY FOR ANY AND ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR ANY PROJECT ENGAGEMENT SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY THE CLIENT TO DEVIONIC UNDER THE APPLICABLE PROJECT AGREEMENT. THIS LIMITATION OF LIABILITY IS A FUNDAMENTAL PART OF THE BARGAIN BETWEEN THE PARTIES.</p>

          {/* ── 10 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Ban size={18} className="text-accent" /> 10. Prohibited Activities
          </h3>
          <p className="text-justify">When using the Devionic website, client portal, or services, you shall not: (a) use the services for any unlawful purpose or in any way that could damage, disable, overburden, or impair Devionic's servers, networks, or infrastructure; (b) attempt to gain unauthorized access to any portion of the website, client portal, systems, or networks connected to Devionic's services; (c) upload, transmit, or distribute any viruses, malware, trojans, worms, or any other malicious code; (d) use automated means (bots, scrapers, spiders) to access or collect data from our platforms without prior written authorization; (e) reverse engineer, decompile, disassemble, or attempt to derive the source code of any software or service provided by Devionic; (f) impersonate any person or entity, or falsely state or misrepresent your affiliation with any person or entity; (g) interfere with or disrupt the integrity or performance of the services or any third-party systems connected thereto; (h) use the services to send unsolicited commercial communications (spam) or engage in any form of harassment; (i) violate any applicable local, national, or international law or regulation.</p>

          {/* ── 11 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Clock size={18} className="text-accent" /> 11. Project Timeline, Delivery, and Acceptance
          </h3>
          <p className="text-justify">Project timelines and milestones are estimated based on the information and materials available at the time of proposal and are provided as good-faith estimates, not guaranteed delivery dates. Devionic shall use commercially reasonable efforts to meet agreed-upon deadlines. Timelines may be adjusted due to: scope changes requested by the Client, delays in receiving Client feedback, approvals, or required materials, unforeseen technical complexity, third-party service outages or API changes beyond Devionic's control, force majeure events, or any other cause beyond Devionic's reasonable control. Upon delivery of each milestone or the final Deliverables, the Client shall have a review period of up to 10 business days to evaluate the work and provide written acceptance or a detailed list of revisions. Deliverables not rejected in writing within the review period may be treated as accepted unless the Client provides a written dispute or request for revision. Post-acceptance change requests will be addressed as separate billable engagements.</p>

          {/* ── 12 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Scale size={18} className="text-accent" /> 12. Project Cancellation, Termination, and Refunds
          </h3>
          <p className="text-justify">Either party may terminate a project engagement with 14 days' written notice. Upon termination: (a) the Client shall pay for all work completed, hours expended, and expenses incurred by Devionic up to the termination date at the agreed rates, regardless of whether the work has been formally delivered; (b) upfront deposits are non-refundable once substantive work has commenced on the project; (c) Devionic shall deliver all completed and in-progress work product to the Client upon receipt of payment for outstanding amounts; (d) Devionic reserves the right to retain and not deliver any proprietary tools, frameworks, or components that are not specific to the Client's project; (e) neither party shall be liable to the other for any indirect, consequential, or incidental damages arising from the termination. Devionic may immediately terminate access and services without prior notice in cases of Client breach of these Terms, fraudulent activity, abusive behavior, or non-payment after written demand.</p>

          {/* ── 13 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <RotateCcw size={18} className="text-accent" /> 13. Refund Policy
          </h3>
          <p className="text-justify">Devionic is committed to fair and transparent handling of all refund requests. Because our primary services involve custom work performed specifically for each client, the following refund terms apply:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Custom Projects (Software, Web, App Development):</strong> Upfront deposits are refundable on a pro-rata basis reflecting work already completed. If no work has commenced, the deposit is fully refundable, less applicable payment-gateway processing fees that are non-recoverable. Milestone payments for milestones already approved by the client are non-refundable.</li>
            <li><strong>Pre-Packaged Products:</strong> Eligible for a full refund within 7 calendar days of purchase if no deliverable has been downloaded, accessed, or delivered.</li>
            <li><strong>Subscriptions &amp; Retainers:</strong> Cancellable at any time. Pro-rata refunds for the unused billing cycle are issued only where required by applicable law.</li>
            <li><strong>Erroneous or Duplicate Payments:</strong> Fully refundable upon verification within 5&ndash;7 business days.</li>
            <li><strong>Services Not Rendered:</strong> Full refund of the amount paid for the undelivered portion if Devionic fails to deliver without fault on the client's part.</li>
          </ul>
          <p className="text-justify">Refund requests must be submitted in writing to <strong>info@devionic.com</strong> with the subject line "Refund Request," including the transaction reference, invoice number, date, amount, reason, and supporting evidence. Requests are acknowledged within 2 business days and resolved within 7&ndash;10 business days. Approved refunds are returned to the original payment method and may take an additional 5&ndash;10 business days to appear in your account. Non-refundable items include: work already performed and milestones already approved; third-party costs (domains, hosting, SSL, licences) incurred on your behalf; deliverables already downloaded, deployed, or transferred; and non-recoverable payment-gateway processing fees. Initiating a chargeback before contacting us may result in account suspension pending resolution.</p>

          {/* ── 14 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <AlertCircle size={18} className="text-accent" /> 14. Indemnification
          </h3>
          <p className="text-justify">The Client agrees to indemnify, defend, and hold harmless Devionic, its officers, directors, employees, and agents from and against any and all claims, demands, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) the Client's breach of any representation, warranty, or obligation under these Terms; (b) the Client's use of the Deliverables in any manner not authorized by the project agreement; (c) any claim that materials provided by the Client to Devionic infringe upon the intellectual property rights, privacy rights, or any other rights of any third party; (d) any content, data, or materials provided by the Client that are defamatory, obscene, unlawful, or otherwise objectionable.</p>

          {/* ── 15 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <AlertCircle size={18} className="text-accent" /> 15. Force Majeure
          </h3>
          <p className="text-justify">Neither party shall be held liable for any failure or delay in the performance of its obligations under these Terms if such failure or delay results from circumstances beyond the reasonable control of that party, including but not limited to: natural disasters, pandemics, epidemics, government actions, wars, terrorism, civil unrest, strikes, labor disputes, power failures, internet outages, cyber attacks, acts of God, or any other event beyond the party's control. The affected party shall notify the other party in writing within 5 business days of the occurrence of such event and shall use commercially reasonable efforts to mitigate its impact. If the force majeure event continues for more than 60 consecutive days, either party may terminate the affected engagement without liability.</p>

          {/* ── 16 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Gavel size={18} className="text-accent" /> 16. Governing Law and Dispute Resolution
          </h3>
          <p className="text-justify">These Terms shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan, without regard to its conflict of laws principles. Any disputes arising out of or related to these Terms shall first be attempted to be resolved through good-faith negotiation between the parties within 30 days of written notice. If negotiation fails, the dispute shall be submitted to mediation through a mutually agreed mediator. If mediation fails within 60 days, either party may pursue legal remedies through the appropriate courts of competent jurisdiction in District Layyah, Punjab, Pakistan. The Client agrees to submit to the jurisdiction of these courts for the resolution of any such disputes. Notwithstanding the foregoing, Devionic may seek injunctive or other equitable relief in any court of competent jurisdiction to protect its intellectual property or confidential information without the requirement to post a bond.</p>

          {/* ── 17 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <FileText size={18} className="text-accent" /> 17. Amendments and Modifications
          </h3>
          <p className="text-justify">Devionic reserves the right to modify, amend, or update these Terms at any time at its sole discretion. Any material changes shall be communicated by posting the revised Terms on the Devionic website with an updated "Last Updated" date. Continued use of the website or services after such changes constitute the Client's acceptance of the modified Terms. Devionic may also notify registered clients via email of significant changes. It is the Client's responsibility to periodically review these Terms for updates.</p>

          {/* ── 18 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Gavel size={18} className="text-accent" /> 18. Severability
          </h3>
          <p className="text-justify">If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it valid and enforceable, and the remaining provisions shall continue in full force and effect without being impaired or invalidated in any way. The parties agree that any such invalid provision shall be replaced with a valid provision that most closely reflects the original intent of the parties.</p>

          {/* ── 19 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Handshake size={18} className="text-accent" /> 19. Entire Agreement
          </h3>
          <p className="text-justify">These Terms, together with any applicable Statement of Work, project proposal, service agreement, or Non-Disclosure Agreement executed between the parties, constitute the entire agreement between the Client and Devionic with respect to the subject matter hereof and supersede all prior or contemporaneous negotiations, representations, warranties, understandings, and agreements, whether written or oral. In the event of any conflict between these Terms and an executed Statement of Work (SOW), project proposal, or service agreement, the terms of the SOW shall prevail with respect to the specific subject matter of the conflict. No waiver of any provision of these Terms shall be deemed a further or continuing waiver of that provision or any other provision.</p>

          {/* ── 20 ── */}
          <h3 className="text-foreground font-semibold flex items-center gap-2">
            <Mail size={18} className="text-accent" /> 20. Contact Information
          </h3>
          <p className="text-justify">For any questions, concerns, or clarifications regarding these Terms and Conditions, please contact us through any of the following channels:</p>
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

export default Terms;
