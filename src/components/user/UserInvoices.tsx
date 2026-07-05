import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

const parseItems = (items: any) => {
  if (typeof items === 'string') {
    try {
      return JSON.parse(items);
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(items) ? items : [];
};
import { FileDown, Search, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

const UserInvoices = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["user-invoices"],
    queryFn: async () => {
      const response = await apiClient.get("/invoices");
      return response.data;
    },
  });

  const downloadInvoice = async (inv: any) => {
    const { downloadDocumentPDF } = await import("@/lib/pdf-download");
    const items = parseItems(inv.items);
    await downloadDocumentPDF({
      type: "invoice",
      number: inv.invoice_number,
      status: inv.status,
      createdAt: inv.created_at,
      dueDate: inv.due_date,
      currency: inv.currency || "PKR",
      clientName: inv.client_name,
      clientEmail: inv.client_email,
      clientPhone: inv.client_phone,
      clientAddress: inv.client_address,
      items: items.map((it: any) => ({
        description: it.description || it.name || "",
        quantity: it.quantity || 1,
        rate: it.rate || it.price || 0,
        amount: it.amount || it.total || 0,
      })),
      subtotal: Number(inv.subtotal) || 0,
      taxRate: Number(inv.tax_rate) || 0,
      taxAmount: Number(inv.tax_amount) || 0,
      discount: Number(inv.discount) || 0,
      total: Number(inv.total) || 0,
      paidAmount: Number(inv.paid_amount) || 0,
      notes: inv.notes,
      verificationId: inv.verification_id || inv.id,
    });
  };


  const filteredInvoices = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Invoices</h2>
          <p className="text-muted-foreground text-sm">Manage and download your invoices</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading invoices...</TableCell></TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">No invoices found.</TableCell></TableRow>
            ) : filteredInvoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{format(new Date(inv.created_at), "MMM d, yyyy")}</TableCell>
                <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    inv.status === "paid" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {inv.status}
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold">${inv.total}</TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="sm" onClick={() => downloadInvoice(inv)}>
                    <FileDown size={16} className="mr-2" /> PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserInvoices;
