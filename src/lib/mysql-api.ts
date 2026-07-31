import apiClient from "@/lib/apiClient";

export async function $dbList({ data }: { data: { table: string; where?: any; order?: string } }) {
  const res = await apiClient.post("/portal/data", { action: "dbList", payload: data });
  return res.data;
}

export async function $dbGet({ data }: { data: { table: string; id: number | string } }) {
  const res = await apiClient.post("/portal/data", { action: "dbGet", payload: data });
  return res.data;
}

export async function $dbCreate({ data }: { data: { table: string; payload: any } }) {
  const res = await apiClient.post("/portal/data", { action: "dbCreate", payload: data });
  return res.data;
}

export async function $dbUpdate({ data }: { data: { table: string; id: number | string; payload: any } }) {
  const res = await apiClient.post("/portal/data", { action: "dbUpdate", payload: data });
  return res.data;
}

export async function $dbDelete({ data }: { data: { table: string; id: number | string } }) {
  const res = await apiClient.post("/portal/data", { action: "dbDelete", payload: data });
  return res.data;
}

export async function $dbCustomQuery({ data }: { data: { query: string; params?: any[] } }) {
  const res = await apiClient.post("/portal/data", { action: "dbCustomQuery", payload: data });
  return res.data;
}

export async function $dbCount({ data }: { data: { table: string; where?: any } }) {
  const res = await apiClient.post("/portal/data", { action: "dbCount", payload: data });
  return res.data;
}

export async function $rpc({ data }: { data: { method: string; args?: any[] } }) {
  const res = await apiClient.post("/portal/data", { action: "rpc", payload: data });
  return res.data;
}

export async function $signIn({ data }: { data: any }) {
  const res = await apiClient.post("/portal/auth", { action: "signIn", payload: data });
  return res.data;
}

export async function $signOut() {
  const res = await apiClient.post("/portal/auth", { action: "signOut", payload: {} });
  return res.data;
}

export async function $getSession() {
  const res = await apiClient.post("/portal/auth", { action: "getSession", payload: {} });
  return res.data;
}
