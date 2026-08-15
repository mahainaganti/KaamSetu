"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deletePayment, getPayments } from "@/lib/api";
import { statusVariant } from "@/lib/badge";
import { useConfirm } from "@/components/ConfirmProvider";
import { useToast } from "@/components/ToastProvider";
import TableSkeleton from "@/components/TableSkeleton";

type Payment = { payment_id: number; booking_id: number; amount: number; payment_method: string; payment_status: string; transaction_id: string; payment_date: string | null };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const confirmAction = useConfirm();
  const showToast = useToast();

  async function loadPayments() { try { const data = await getPayments(); setError(""); setPayments(data); } catch (err) { setError(err instanceof Error ? err.message : "Failed to fetch payments."); } finally { setLoading(false); } }
  useEffect(() => { getPayments().then((data) => { setError(""); setPayments(data); }).catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch payments.")).finally(() => setLoading(false)); }, []);

  async function handleDelete(payment: Payment) {
    const confirmed = await confirmAction({
      title: "Delete payment?",
      message: "Are you sure you want to delete this payment?",
      confirmLabel: "Delete Payment",
    });
    if (!confirmed) return;

    setDeletingId(payment.payment_id); setError("");
    try {
      await deletePayment(String(payment.payment_id));
      await loadPayments();
      showToast(`Payment #${payment.payment_id} was deleted.`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete payment.";
      setError(message);
      showToast(message, "error");
    } finally { setDeletingId(null); }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return payments;
    return payments.filter((payment) => payment.transaction_id.toLowerCase().includes(query) || String(payment.booking_id).includes(query));
  }, [payments, search]);

  return (
    <div className="page-container">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-description">Manage booking payments.</p>
        </div>
        <Link href="/payments/new" className="primary-button">+ New Payment</Link>
      </div>
      <div className="table-container">
        <div className="toolbar">
          <div className="search-field">
            <span className="search-field-icon">🔍</span>
            <input type="text" placeholder="Search by transaction or booking ID..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search payments" />
          </div>
          <span className="result-count">{filtered.length} of {payments.length} payments</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Payment ID</th><th>Booking ID</th><th>Amount</th><th>Method</th><th>Status</th><th>Transaction ID</th><th>Payment Date</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <TableSkeleton columns={8} />
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <span className="empty-state-icon">💳</span>
                    <span className="empty-state-title">No payments found</span>
                    <span className="empty-state-description">
                      {payments.length === 0 ? "Record your first payment to get started." : "Try a different search term."}
                    </span>
                  </div>
                </td></tr>
              ) : filtered.map((payment) => (
                <tr key={payment.payment_id}>
                  <td>{payment.payment_id}</td>
                  <td>{payment.booking_id}</td>
                  <td>₹{payment.amount}</td>
                  <td>{payment.payment_method}</td>
                  <td><span className={`badge ${statusVariant(payment.payment_status)}`}>{payment.payment_status}</span></td>
                  <td><Link href={`/payments/${payment.payment_id}`} className="link-primary">{payment.transaction_id}</Link></td>
                  <td>{payment.payment_date ?? "Not set"}</td>
                  <td>
                    <div className="row-actions">
                      <Link href={`/payments/${payment.payment_id}`} className="action-link view">View</Link>
                      <Link href={`/payments/edit/${payment.payment_id}`} className="action-link edit">Edit</Link>
                      <button type="button" className="btn-delete" onClick={() => handleDelete(payment)} disabled={deletingId === payment.payment_id}>{deletingId === payment.payment_id ? "Deleting..." : "Delete"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && <div className="table-error">{error}</div>}
      </div>
    </div>
  );
}
