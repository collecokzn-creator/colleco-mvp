import React, { useEffect, useState } from "react";
import AutoSyncBanner from "../components/ui/AutoSyncBanner";
import ComplianceStatusCard from "../components/ui/ComplianceStatusCard";
import VerifiedBadge from "../components/ui/VerifiedBadge";
import { isApiEnabled as providersApiEnabled, listProviders, uploadDocument, verifyProvider } from "../api/providersApi";

// Helpers for expiry states
function isExpired(ts) {
	if (!ts) return false;
	return Number(ts) < Date.now();
}

function isExpiringSoon(ts, days = 30) {
	if (!ts) return false;
	const now = Date.now();
	const diff = Number(ts) - now;
	return diff > 0 && diff <= days * 24 * 60 * 60 * 1000;
}

export default function Compliance() {
	const [providers, setProviders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

	const REQUIRED_TYPES = ["license", "insurance", "permit"]; // demo baseline

	useEffect(() => {
		(async () => {
			if (!providersApiEnabled) return;
			try { setLoading(true); setError("");
				const list = await listProviders();
				setProviders(list);
			} catch (e) { setError(e.message || 'Failed to load providers'); }
			finally { setLoading(false); }
		})();
	}, []);

	function computeCounts(list) {
		let valid = 0, expiring = 0, missing = 0;
		for (const p of list) {
			const docs = Array.isArray(p.documents) ? p.documents : [];
			const presentTypes = new Set(docs.map(d => d.docType));
			for (const t of REQUIRED_TYPES) {
				if (!presentTypes.has(t)) missing += 1;
			}
			for (const d of docs) {
				if (isExpired(d.expiresAt)) continue;
				if (isExpiringSoon(d.expiresAt)) expiring += 1; else valid += 1;
			}
		}
		return { valid, expiring, missing };
	}

	const viewProviders = showVerifiedOnly ? (providers || []).filter(p => p.verified) : (providers || []);
	const counts = computeCounts(viewProviders);

	async function onUpload(e) {
		e.preventDefault();
		const form = e.currentTarget;
		const providerId = form.providerId.value;
		const docType = form.docType.value;
		const file = form.file.files?.[0];
		const expires = form.expiresAt.value ? new Date(form.expiresAt.value).getTime() : undefined;
		if (!providerId || !docType || !file) return;
		if (!providersApiEnabled) { alert('Upload stub — enable API to persist'); return; }
		try {
			setLoading(true); setError("");
			await uploadDocument({ providerId, docType, fileName: file.name, fileSize: file.size, expiresAt: expires });
			const list = await listProviders(); setProviders(list);
			form.reset();
		} catch (e) { setError(e.message || 'Upload failed'); }
		finally { setLoading(false); }
	}

	async function onVerify(providerId) {
		if (!providersApiEnabled) { alert('Verify stub — enable API to persist'); return; }
		try { setLoading(true); setError("");
			await verifyProvider(providerId, true);
			const list = await listProviders(); setProviders(list);
		} catch (e) { setError(e.message || 'Verify failed'); }
		finally { setLoading(false); }
	}

	return (
		<div className="text-brand-brown">
			<h2 className="text-xl font-bold mb-4">🛡️ Compliance Center</h2>
			<div className="mb-3"><AutoSyncBanner message="Documents are validated automatically; expiry reminders are sent before deadlines." /></div>
			<div className="mb-4"><ComplianceStatusCard valid={counts.valid} expiring={counts.expiring} missing={counts.missing} /></div>
			<div className="bg-cream-sand p-4 border border-cream-border rounded">
				<p className="mb-2">Upload and manage licenses, permits, and insurance documents.</p>
				<p className="text-brand-brown/70 text-sm">Automation-ready placeholder — upload tools and live validation results will appear here.</p>
				<form className="mt-3 flex flex-col sm:flex-row gap-2" onSubmit={onUpload}>
					<input name="providerId" className="border rounded px-2 py-1 flex-1" placeholder="Provider ID (e.g., hotel-123)" required />
					<select name="docType" className="border rounded px-2 py-1">
						<option value="license">Business license</option>
						<option value="insurance">Insurance certificate</option>
						<option value="permit">Operating permit</option>
					</select>
					<input name="file" type="file" className="border rounded px-2 py-1" />
					<input name="expiresAt" type="date" className="border rounded px-2 py-1" aria-label="Expiry date" />
					<button className="px-3 py-1.5 bg-brand-orange text-white rounded">Upload</button>
				</form>
				{error ? <div className="text-sm text-red-600 mt-2">{error}</div> : null}
				{loading ? <div className="text-sm text-brand-brown/70 mt-2">Loading…</div> : null}
				<div className="mt-4">
					{counts.expiring > 0 ? (
						<div className="mb-2 text-sm flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1 rounded">
							<span className="font-medium">Heads up:</span>
							<span>{counts.expiring} document{counts.expiring>1?'s':''} expiring soon.</span>
						</div>
					) : null}
					<div className="flex items-center justify-between mb-1">
						<div className="font-semibold">Providers</div>
						<label className="text-sm flex items-center gap-2">
							<input type="checkbox" className="accent-brand-orange" checked={showVerifiedOnly} onChange={e => setShowVerifiedOnly(e.target.checked)} />
							<span>Verified only</span>
						</label>
					</div>
					{!providersApiEnabled ? (
						<div className="text-sm text-brand-brown/70">Enable API to view persisted providers/documents.</div>
					) : (
						<ul className="space-y-2">
							{(viewProviders || []).map(p => (
								<li key={p.id} className="border border-cream-border rounded p-2 bg-cream">
									<div className="flex items-center justify-between">
										<div>
											<div className="font-semibold">{p.name || p.id} <VerifiedBadge verified={p.verified} /></div>
											<div className="text-xs text-brand-brown/70">ID: {p.id}</div>
										</div>
										{!p.verified ? (
											<button onClick={() => onVerify(p.id)} className="text-xs px-2 py-1 rounded bg-emerald-600 text-white">Mark Verified</button>
										) : null}
									</div>
																		{(p.documents || []).length ? (
										<ul className="text-sm mt-2">
											{p.documents.map(d => (
																								<li key={d.id} className="flex items-center justify-between border-t border-cream-border py-1">
																										<span>
																											{d.docType} — {d.fileName} <span className="text-xs text-brand-brown/60">({Math.ceil((d.fileSize||0)/1024)} KB)</span>
																											{d.expiresAt ? (
																												<span className="ml-2 text-xs text-brand-brown/70">Exp: {new Date(d.expiresAt).toLocaleDateString()}</span>
																											) : null}
																										</span>
																																																	<span className="text-xs text-brand-brown/70 flex items-center gap-2">
																																																		{isExpired(d.expiresAt) ? (
																																																			<span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">Expired</span>
																																																		) : isExpiringSoon(d.expiresAt) ? (
																																																			<span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">Expiring soon</span>
																																																		) : null}
																																																		{d.status || 'pending'}
																																																	</span>
												</li>
											))}
										</ul>
									) : null}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}