function DetectionList({ detections }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-slate-900">
        Detected Objects
      </h2>

      {detections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            No objects detected.
          </p>
        </div>
      ) : (
        <div className="space-y-3">

          {detections.map((detection, index) => {
            const confidence = (
              detection.confidence * 100
            ).toFixed(1);

            return (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >

                {/* Object Information */}
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <span className="text-sm font-bold text-blue-600">
                      AI
                    </span>
                  </div>

                  <div>
                    <strong className="block text-sm font-semibold capitalize text-slate-900">
                      {detection.name}
                    </strong>

                    <span className="text-xs text-slate-500">
                      YOLO Detection
                    </span>
                  </div>

                </div>

                {/* Confidence */}
                <strong className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {confidence}%
                </strong>

              </div>
            );
          })}

        </div>
      )}
    </section>
  );
}

export default DetectionList;