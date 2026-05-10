import { useCallback, useEffect, useState } from "react";
import { listReports } from "../services/api";

export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listReports();
      setReports(Array.isArray(data) ? data : data?.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { reports, loading, reload, setReports };
}
