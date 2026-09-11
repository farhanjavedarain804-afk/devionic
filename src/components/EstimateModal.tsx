import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator, CheckCircle2, MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EstimateModalProps {
  open: boolean;
  onClose: () => void;
}

const services = [
  "Custom Software Development",
  "Web Application Development",
  "Mobile App (iOS / Android)",
  "UI/UX Design",
  "AI & Automation Solutions",
  "Cloud Migration & Infrastructure",
  "ERP / CRM System",
  "E-commerce Platform",
  "Digital Marketing & SEO",
  "IT Support & Maintenance",
  "Other / Not Sure Yet",
];

const budgets = ["< $1,000", "$1,000 – $5,000", "$5,000 – $15,000", "$15,000 – $50,000", "$50,000+", "Discuss with Team"];
const timelines = ["ASAP", "1 – 3 Months", "3 – 6 Months", "6+ Months", "Flexible"];

const EstimateModal = ({ open, onClose }: EstimateModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi Devionic! 👋 I'd like to get a project estimate.\n\n` +
      `📌 *Service:* ${selectedService || "Not specified"}\n` +
      `💰 *Budget:* ${budget || "Not specified"}\n` +
      `⏱️ *Timeline:* ${timeline || "Not specified"}\n` +
      `👤 *Name:* ${name || "Not provided"}\n\n` +
      `Looking forward to discussing this with your team!`
    );
    window.open(`https://wa.me/923177121841?text=${msg}`, "_blank");
    onClose();
  };

  const reset = () => {
    setStep(1); setSelectedService(""); setBudget(""); setTimeline(""); setName(""); setPhone("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-primary px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan/20 flex items-center justify-center">
                  <Calculator size={18} className="text-cyan" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Get a Free Project Estimate</p>
                  <p className="text-white/60 text-xs">Takes less than 2 minutes</p>
                </div>
              </div>
              <button onClick={() => { onClose(); reset(); }} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Progress */}
            <div className="flex h-1">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`flex-1 transition-colors duration-500 ${step >= s ? "bg-cyan" : "bg-border"}`} />
              ))}
            </div>

            <div className="p-6">
              {/* Step 1: Service */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="text-lg font-bold text-card-foreground mb-1">What service do you need?</h3>
                  <p className="text-muted-foreground text-sm mb-4">Select the primary service you're interested in.</p>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                    {services.map((s) => (
                      <button key={s} onClick={() => setSelectedService(s)}
                        className={`text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${selectedService === s ? "border-cyan bg-cyan/10 text-cyan" : "border-border hover:border-cyan/40 text-card-foreground hover:bg-muted/50"}`}>
                        {selectedService === s && <CheckCircle2 size={14} className="inline mr-2 text-cyan" />}
                        {s}
                      </button>
                    ))}
                  </div>
                  <Button variant="cyan" className="w-full mt-4" disabled={!selectedService} onClick={() => setStep(2)}>
                    Continue →
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Budget & Timeline */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="text-lg font-bold text-card-foreground mb-1">Budget & Timeline</h3>
                  <p className="text-muted-foreground text-sm mb-4">Help us tailor the best solution for you.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-card-foreground mb-2 block">Approximate Budget</label>
                      <div className="grid grid-cols-2 gap-2">
                        {budgets.map((b) => (
                          <button key={b} onClick={() => setBudget(b)}
                            className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${budget === b ? "border-cyan bg-cyan/10 text-cyan" : "border-border hover:border-cyan/40 text-card-foreground"}`}>
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-card-foreground mb-2 block">Preferred Timeline</label>
                      <div className="grid grid-cols-2 gap-2">
                        {timelines.map((t) => (
                          <button key={t} onClick={() => setTimeline(t)}
                            className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${timeline === t ? "border-cyan bg-cyan/10 text-cyan" : "border-border hover:border-cyan/40 text-card-foreground"}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>← Back</Button>
                    <Button variant="cyan" className="flex-1" disabled={!budget || !timeline} onClick={() => setStep(3)}>Continue →</Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Contact & Send */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="text-lg font-bold text-card-foreground mb-1">Almost done!</h3>
                  <p className="text-muted-foreground text-sm mb-4">Share your details and we'll connect via WhatsApp instantly.</p>

                  {/* Summary */}
                  <div className="bg-muted/40 rounded-xl p-4 border border-border mb-5 space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Service:</span><span className="font-medium text-card-foreground">{selectedService}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Budget:</span><span className="font-medium text-card-foreground">{budget}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Timeline:</span><span className="font-medium text-card-foreground">{timeline}</span></div>
                  </div>

                  <div className="space-y-3">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Your Name (optional)"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan transition-colors" />
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone / WhatsApp (optional)"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan transition-colors" />
                  </div>

                  <div className="flex gap-3 mt-5">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>← Back</Button>
                    <Button onClick={handleWhatsApp}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white gap-2">
                      <MessageCircle size={16} /> Send via WhatsApp
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-3">We typically respond within 30 minutes during business hours.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EstimateModal;
