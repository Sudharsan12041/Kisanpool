import { useRef, useState } from "react";
import { Check, ImagePlus, Leaf, RotateCcw, Sparkles, UploadCloud } from "lucide-react";
import { gradePhoto } from "../api";
import { PageHeading, StatusBadge } from "../components/ui";

export default function QualityGrading() {
  const fileInput = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function chooseFile(nextFile) {
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setError("Choose an image file to continue.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
    setResult(null);
    setError("");
  }

  function removePhoto() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    setResult(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      setResult(await gradePhoto(file));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeading eyebrow="POST-HARVEST QUALITY" title="Quality, with clarity." description="Upload a produce photo to request an AI assessment. Results are shown only when the grading service responds." />
      <div className="quality-grid">
        <section className="panel quality-upload-panel">
          <div className="panel-heading"><div><p className="eyebrow">PRODUCE SAMPLE</p><h3>Upload a clear photo</h3></div><span className="quality-step">STEP 01</span></div>
          <input ref={fileInput} className="visually-hidden" type="file" accept="image/*" onChange={(event) => chooseFile(event.target.files?.[0])} />
          {preview ? (
            <div className="quality-preview">
              <img src={preview} alt="Produce selected for quality assessment" />
              <button onClick={removePhoto} className="button button-secondary remove-photo"><RotateCcw size={15} /> Replace photo</button>
            </div>
          ) : (
            <button type="button" className="dropzone" onClick={() => fileInput.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files?.[0]); }}>
              <span className="dropzone-icon"><UploadCloud size={23} /></span><strong>Drop a photo here, or browse</strong><small>Use a well-lit image of the harvested produce.</small><span className="dropzone-format">JPG · PNG · WEBP</span>
            </button>
          )}
          {error && <p className="inline-error" role="alert">{error}</p>}
          <button className="button button-primary button-large form-submit" onClick={analyze} disabled={!file || loading}>
            {loading ? <><span className="button-spinner" /> Requesting assessment…</> : <><Sparkles size={17} /> Analyze produce</>}
          </button>
          <p className="form-footnote">Images are sent to the configured backend. KisanPool does not generate a sample result if the model is unavailable.</p>
        </section>
        <section className="panel quality-result-panel">
          <div className="panel-heading"><div><p className="eyebrow">ASSESSMENT</p><h3>Grading result</h3></div><span className="result-leaf"><Leaf size={18} /></span></div>
          {result ? (
            <div className="grade-result">
              <span className="grade-circle">{result.grade || "—"}</span><p className="eyebrow">PRODUCE GRADE</p><h4>Grade {result.grade || "not provided"}</h4>
              {result.confidence != null && <div className="confidence-line"><span>Model confidence</span><strong>{Math.round(Number(result.confidence) * (Number(result.confidence) <= 1 ? 100 : 1))}%</strong></div>}
              {result.explanation && <p className="grade-explanation">{result.explanation}</p>}
              {result.reason && !result.explanation && <p className="grade-explanation">{result.reason}</p>}
              <StatusBadge status="GRADED" />
            </div>
          ) : (
            <div className="result-placeholder"><span className="result-placeholder-icon"><ImagePlus size={22} /></span><h4>Your result will appear here</h4><p>Choose an image and request an assessment. No grade or confidence score is invented.</p></div>
          )}
          <div className="grade-meaning"><span><Check size={15} />Results reflect the grading service response only.</span></div>
        </section>
      </div>
      <div className="notice-card notice-blue"><strong>AI grading service status</strong><span>The frontend calls POST /grade. That endpoint is not present in the current FastAPI backend, so grading remains unavailable until the service is implemented.</span></div>
    </div>
  );
}
