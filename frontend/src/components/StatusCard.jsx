function StatusCard({
  status,
  duration,
  personDetected,
  phoneDetected,
}) {
  const getStatusClass = () => {
    if (status === "Focused Working") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (status === "Digital Distraction Detected") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (status === "Away Mode") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-slate-900">
        FocusGuard Result
      </h2>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        
        {/* Status Header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium text-slate-500">
            Current Status
          </span>

          <strong
            className={`inline-flex w-fit items-center rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClass()}`}
          >
            {status}
          </strong>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">

          {/* Duration */}
          <div className="rounded-xl bg-slate-50 p-4">
            <span className="text-sm text-slate-500">
              Phone Duration
            </span>

            <strong className="mt-2 block text-2xl font-bold text-slate-900">
              {Number(duration).toFixed(1)}s
            </strong>
          </div>

          {/* Person */}
          <div className="rounded-xl bg-slate-50 p-4">
            <span className="text-sm text-slate-500">
              Person
            </span>

            <strong
              className={`mt-2 block text-lg font-semibold ${
                personDetected
                  ? "text-emerald-600"
                  : "text-slate-500"
              }`}
            >
              {personDetected
                ? "Detected"
                : "Not Detected"}
            </strong>
          </div>

          {/* Phone */}
          <div className="rounded-xl bg-slate-50 p-4">
            <span className="text-sm text-slate-500">
              Phone
            </span>

            <strong
              className={`mt-2 block text-lg font-semibold ${
                phoneDetected
                  ? "text-red-600"
                  : "text-emerald-600"
              }`}
            >
              {phoneDetected
                ? "Detected"
                : "Not Detected"}
            </strong>
          </div>

        </div>
      </div>
    </section>
  );
}

export default StatusCard;