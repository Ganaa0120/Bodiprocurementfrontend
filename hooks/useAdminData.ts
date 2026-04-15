import { useState, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export function useAdminData() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [recentPersons, setRecentPersons] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [dashStats, setDashStats] = useState<any>(null);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [personsLoading, setPersonsLoading] = useState(false);
  const [recentLoading, setRecentLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [adminsError, setAdminsError] = useState("");
  const [personsError, setPersonsError] = useState("");

  const tok = () => localStorage.getItem("token");
  const hdr = () => ({ Authorization: `Bearer ${tok()}` });

  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    setAdminsError("");
    try {
      const res = await fetch(`${API}/api/super-admins`, { headers: hdr() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAdmins(data.admins ?? []);
    } catch (e: any) {
      setAdminsError(e.message);
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  const fetchPersons = useCallback(async (status = "") => {
    setPersonsLoading(true);
    setPersonsError("");
    try {
      const p = new URLSearchParams({
        limit: "50",
        ...(status ? { status } : {}),
      });
      const res = await fetch(`${API}/api/persons?${p}`, { headers: hdr() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPersons(data.persons ?? []);
    } catch (e: any) {
      setPersonsError(e.message);
    } finally {
      setPersonsLoading(false);
    }
  }, []);

  const fetchRecent = useCallback(async () => {
    setRecentLoading(true);
    try {
      const res = await fetch(`${API}/api/persons?limit=10`, {
        headers: hdr(),
      });
      const data = await res.json();
      if (data.success) setRecentPersons(data.persons ?? []);
    } catch {
    } finally {
      setRecentLoading(false);
    }
  }, []);

  const fetchDashStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/super-admins/dashboard`, {
        headers: hdr(),
      });
      const data = await res.json();
      if (data.success) setDashStats(data.stats);
    } catch {}
  }, []);

  const fetchCompanies = useCallback(async () => {
    setCompaniesLoading(true);
    try {
      const res = await fetch(`${API}/api/organizations?limit=50`, {
        headers: hdr(),
      });
      const data = await res.json();
      if (data.success) setCompanies(data.organizations ?? []);
    } catch {
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

  const updatePersonStatus = async (
    id: string,
    status: string,
    reason = "",
  ) => {
    const res = await fetch(`${API}/api/persons/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...hdr() },
      body: JSON.stringify({ status, return_reason: reason || null }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setPersons((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
    setRecentPersons((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const deleteAdmin = async (id: string) => {
    const res = await fetch(`${API}/api/super-admins/${id}`, {
      method: "DELETE",
      headers: hdr(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setAdmins((p) => p.filter((a) => a.id !== id));
  };

  const toggleAdminStatus = async (admin: any) => {
    const newStatus = admin.status === "active" ? "inactive" : "active";
    const res = await fetch(`${API}/api/super-admins/${admin.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...hdr() },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setAdmins((p) =>
      p.map((a) => (a.id === admin.id ? { ...a, status: newStatus } : a)),
    );
    return newStatus;
  };

  return {
    admins,
    persons,
    recentPersons,
    companies,
    dashStats,
    adminsLoading,
    personsLoading,
    recentLoading,
    companiesLoading,
    adminsError,
    personsError,
    fetchAdmins,
    fetchPersons,
    fetchRecent,
    fetchDashStats,
    fetchCompanies,
    updatePersonStatus,
    deleteAdmin,
    toggleAdminStatus,
  };
}
