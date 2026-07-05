import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { FileDown, Search, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { downloadReceiptPDF } from "@/lib/pdf-download";

const UserTransactions = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["user-transactions"],
    queryFn: async () => {
      const response = await apiClient.get("/financials");
      return response.data || [];
    },
  });

  const downloadReceipt = async (tx: any) => {
    try {
      await downloadReceiptPDF({
        displayId: tx.display_id,
        date: format(new Date(tx.entry_date || Date.now()), "yyyy-MM-dd"),
        time: format(new Date(tx.entry_date || Date.now()), "HH:mm:ss"),
        type: tx.type === "income" ? "income" : "expense",
        category: tx.category || "General",
        description: tx.description || "Transaction Receipt",
        amount: Number(tx.amount) || 0,
        currency: "PKR",
        paymentMethod: tx.payment_method || "cash",
        fromName: tx.from_name || (tx.type === "income" ? tx.client_name : "DEVIONIC"),
        toName: tx.to_name || (tx.type === "expense" ? tx.client_name : "DEVIONIC"),
        referenceNumber: tx.reference_number,
      });
    } catch (err) {
      console.error("Receipt PDF Error:", err);
    }
  };

  const filteredTransactions = transactions.filter(tx =>
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.display_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Transactions</h2>
          <p className="text-muted-foreground text-sm">View and download your transaction receipts</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search transactions..."
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
              <TableHead>ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading transactions...</TableCell></TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">No transactions found.</TableCell></TableRow>
            ) : filteredTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{format(new Date(tx.entry_date), "MMM d, yyyy")}</TableCell>
                <TableCell className="font-mono text-xs">{tx.display_id}</TableCell>
                <TableCell>{tx.description}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    tx.type === "income" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}>
                    {tx.type}
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold">${tx.amount}</TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="sm" onClick={() => downloadReceipt(tx)}>
                    <FileDown size={16} className="mr-2" /> Receipt
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

export default UserTransactions;
