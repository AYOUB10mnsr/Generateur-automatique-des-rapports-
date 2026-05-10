import { useEffect, useState } from "react";
import { getReportById } from "../services/api";

export function useQueryReport(id) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getReportById(id);
        if (alive) setReport(data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  return { report, loading, setReport };
}
